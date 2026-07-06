<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SecurityLog;
use App\Models\User;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Services\MailService;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    // ── Inscription ───────────────────────────────────────────────────────

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:150',
            'email'      => 'required|email|unique:users,email',
            'password'   => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            'company'    => 'required|string|max:150',
            'siren'      => 'nullable|string|size:9|regex:/^[0-9]{9}$/',
        ], [
            'first_name.required'  => 'Le prénom est obligatoire.',
            'last_name.required'   => 'Le nom est obligatoire.',
            'email.required'       => 'L\'email est obligatoire.',
            'email.email'          => 'L\'adresse email n\'est pas valide.',
            'email.unique'         => 'Cette adresse email est déjà utilisée.',
            'password.required'    => 'Le mot de passe est obligatoire.',
            'password.confirmed'   => 'Les mots de passe ne correspondent pas.',
            'company.required'     => 'L\'entreprise est obligatoire.',
            'siren.size'           => 'Le SIREN doit contenir exactement 9 chiffres.',
            'siren.regex'          => 'Le SIREN ne doit contenir que des chiffres.',
        ]);

        $verificationToken = Str::random(64);

        $user = User::create([
            'first_name'                => $data['first_name'],
            'last_name'                 => $data['last_name'],
            'email'                     => $data['email'],
            'password'                  => Hash::make($data['password']),
            'company'                   => $data['company'] ?? null,
            'siren'                     => $data['siren'] ?? null,
            'role'                      => 'user',
            'is_email_verified'         => false,
            'is_active'                 => false,
            'email_verification_token'  => $verificationToken,
        ]);

        $verifyUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/')
            . '/verifier-email?token=' . $verificationToken
            . '&email=' . urlencode($user->email);

        MailService::send(
            $user->email,
            'Confirmez votre adresse email — CYNA',
            "<p>Bonjour {$user->first_name},</p>"
            . "<p>Merci de vous être inscrit sur CYNA. Cliquez sur le lien ci-dessous pour activer votre compte :</p>"
            . "<p><a href=\"{$verifyUrl}\">Confirmer mon adresse email</a></p>"
            . "<p>Ce lien expire dans 24 heures.</p>"
            . "<p>Si vous n'avez pas créé de compte, ignorez cet email.</p>",
            $user->first_name . ' ' . $user->last_name
        );

        return response()->json([
            'requires_verification' => true,
            'message' => 'Compte créé. Vérifiez votre boîte email pour activer votre compte.',
        ], 201);
    }

    // ── Connexion ─────────────────────────────────────────────────────────

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required'    => 'L\'email est obligatoire.',
            'password.required' => 'Le mot de passe est obligatoire.',
        ]);

        $key     = 'login:' . $request->ip() . '|' . $data['email'];
        $lockKey = 'login_lock:' . $request->ip() . '|' . $data['email'];

        if (Cache::has($lockKey)) {
            $seconds = Cache::get($lockKey) - time();
            return response()->json([
                'message' => "Trop de tentatives. Réessayez dans {$seconds} secondes.",
            ], 429);
        }

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password ?? '')) {
            RateLimiter::hit($key, 120);

            SecurityLog::create([
                'user_id'       => $user?->id,
                'event_type'    => 'login_failed',
                'resource_name' => 'user',
                'resource_id'   => $data['email'],
                'ip_address'    => $request->ip(),
            ]);

            if (RateLimiter::tooManyAttempts($key, 3)) {
                Cache::put($lockKey, time() + 60, 60);
                RateLimiter::clear($key);

                SecurityLog::create([
                    'user_id'       => $user?->id,
                    'event_type'    => 'login_locked',
                    'resource_name' => 'user',
                    'resource_id'   => $data['email'],
                    'ip_address'    => $request->ip(),
                ]);

                return response()->json([
                    'message' => 'Trop de tentatives. Réessayez dans 60 secondes.',
                ], 429);
            }

            return response()->json(['message' => 'Email ou mot de passe incorrect.'], 401);
        }

        RateLimiter::clear($key);
        Cache::forget($lockKey);

        if (!$user->is_email_verified) {
            return response()->json([
                'message'               => 'Veuillez confirmer votre adresse email avant de vous connecter.',
                'requires_verification' => true,
            ], 403);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Votre compte a été désactivé.'], 403);
        }

        // Si admin avec 2FA activé et confirmé → demander le code TOTP
        if ($user->role === 'admin' && $user->two_factor_enabled && $user->two_factor_confirmed_at) {
            $pendingToken = Str::random(64);
            Cache::put("2fa_pending:{$pendingToken}", $user->id, now()->addMinutes(10));

            return response()->json([
                'requires_2fa'  => true,
                'pending_token' => $pendingToken,
                'message'       => 'Code de vérification requis.',
            ]);
        }

        $remember  = $request->boolean('remember_me', false);
        $expiresAt = $remember ? now()->addDays(30) : now()->addDay();

        $user->tokens()->delete();
        $token = $user->createToken('api-token', ['*'], $expiresAt)->plainTextToken;

        return response()->json([
            'user'  => $this->formatUser($user),
            'token' => $token,
        ]);
    }

    // ── Déconnexion ───────────────────────────────────────────────────────

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    // ── Profil ────────────────────────────────────────────────────────────

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json(array_merge($this->formatUser($user), [
            'two_factor_enabled' => $user->two_factor_enabled && $user->two_factor_confirmed_at !== null,
        ]));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'first_name'       => 'sometimes|string|max:100',
            'last_name'        => 'sometimes|string|max:150',
            'email'            => 'sometimes|email|unique:users,email,' . $user->id,
            'company'          => 'nullable|string|max:150',
            'current_password' => 'required_with:password|string',
            'password'         => ['nullable', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ], [
            'email.unique'                   => 'Cette adresse email est déjà utilisée.',
            'current_password.required_with' => 'Le mot de passe actuel est requis.',
            'password.confirmed'             => 'Les mots de passe ne correspondent pas.',
        ]);

        if (isset($data['current_password'])) {
            if (!Hash::check($data['current_password'], $user->password)) {
                return response()->json(['message' => 'Mot de passe actuel incorrect.'], 422);
            }
            if (isset($data['password'])) {
                $user->password = Hash::make($data['password']);
            }
        }

        $pendingEmailSent = false;

        if (isset($data['email']) && $data['email'] !== $user->email) {
            $pendingToken = Str::random(64);
            $pendingEmail = $data['email'];

            $user->pending_email       = $pendingEmail;
            $user->pending_email_token = $pendingToken;

            $confirmUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/')
                . '/confirmer-changement-email?token=' . $pendingToken
                . '&email=' . urlencode($pendingEmail);

            MailService::send(
                $pendingEmail,
                'Confirmez votre nouvelle adresse email — CYNA',
                "<p>Bonjour {$user->first_name},</p>"
                . "<p>Cliquez sur le lien ci-dessous pour confirmer votre nouvelle adresse email :</p>"
                . "<p><a href=\"{$confirmUrl}\">Confirmer ma nouvelle adresse email</a></p>"
                . "<p>Si vous n'avez pas demandé ce changement, ignorez cet email.</p>",
                $user->first_name . ' ' . $user->last_name
            );

            $pendingEmailSent = true;
            unset($data['email']);
        }

        $user->fill(\Arr::except($data, ['current_password', 'password', 'password_confirmation', 'email']));
        $user->save();

        $response = $this->formatUser($user);
        if ($pendingEmailSent) {
            $response['pending_email_sent'] = true;
            $response['pending_email']      = $user->pending_email;
        }

        return response()->json($response);
    }

    // ── Droit à l'oubli RGPD ─────────────────────────────────────────────

    public function deleteAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'password' => 'required|string',
        ], [
            'password.required' => 'Le mot de passe est requis pour confirmer la suppression.',
        ]);

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Mot de passe incorrect.'], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Votre compte a été supprimé définitivement conformément au RGPD.']);
    }

    // ── Vérification email ────────────────────────────────────────────────

    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)
            ->where('email_verification_token', $request->token)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Lien de vérification invalide ou expiré.'], 422);
        }

        if ($user->is_email_verified) {
            return response()->json(['message' => 'Votre adresse email est déjà confirmée.']);
        }

        if ($user->created_at->diffInHours(now()) > 24) {
            return response()->json([
                'message' => 'Ce lien a expiré (valide 24h). Veuillez créer un nouveau compte.',
            ], 422);
        }

        $user->update([
            'is_email_verified'        => true,
            'is_active'                => true,
            'email_verification_token' => null,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Email confirmé. Votre compte est maintenant actif.',
            'user'    => $this->formatUser($user),
            'token'   => $token,
        ]);
    }

    // ── Confirmation changement email ────────────────────────────────────

    public function confirmEmailChange(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
        ]);

        $user = User::where('pending_email', $request->email)
            ->where('pending_email_token', $request->token)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Lien de confirmation invalide ou déjà utilisé.'], 422);
        }

        $user->update([
            'email'               => $request->email,
            'pending_email'       => null,
            'pending_email_token' => null,
        ]);

        return response()->json([
            'message' => 'Adresse email mise à jour avec succès.',
            'user'    => $this->formatUser($user),
        ]);
    }

    // ── Mot de passe oublié ───────────────────────────────────────────────

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Si cet email existe, un lien de réinitialisation vous a été envoyé.']);
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        $resetUrl = rtrim(config('app.frontend_url', 'http://localhost:5174'), '/')
            . '/reinitialiser-mot-de-passe?token=' . $token
            . '&email=' . urlencode($request->email);

        MailService::send(
            $user->email,
            'Réinitialisation de votre mot de passe CYNA',
            "<p>Bonjour {$user->first_name},</p>"
            . "<p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>"
            . "<p><a href=\"{$resetUrl}\">Réinitialiser mon mot de passe</a></p>"
            . "<p>Ce lien expire dans 24 heures.</p>",
            $user->first_name . ' ' . $user->last_name
        );

        return response()->json(['message' => 'Si cet email existe, un lien de réinitialisation vous a été envoyé.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record || now()->diffInHours($record->created_at) > 24 || !Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Token invalide ou expiré.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        $user->tokens()->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }

    // ── Export RGPD ───────────────────────────────────────────────────────

    public function exportMyData(Request $request): \Illuminate\Http\Response
    {
        $user = $request->user()->load(['orders', 'subscriptions']);

        $data = [
            'export_date' => now()->toIso8601String(),
            'profil' => [
                'id'         => $user->id,
                'prenom'     => $user->first_name,
                'nom'        => $user->last_name,
                'email'      => $user->email,
                'entreprise' => $user->company,
                'role'       => $user->role,
                'inscription' => $user->created_at,
            ],
            'commandes'   => $user->orders,
            'abonnements' => $user->subscriptions,
        ];

        return response(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), 200, [
            'Content-Type'        => 'application/json; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="mes-donnees-cyna-' . now()->format('Y-m-d') . '.json"',
        ]);
    }

    // ── 2FA — Vérification au login ───────────────────────────────────────

    /**
     * POST /api/auth/admin/verify-2fa
     * Vérifie le code TOTP après la connexion (si 2FA activé)
     */
    public function verifyAdmin2FA(Request $request): JsonResponse
    {
        $request->validate([
            'pending_token' => 'required|string',
            'code'          => 'required|string|size:6',
        ]);

        $userId = Cache::get("2fa_pending:{$request->pending_token}");

        if (!$userId) {
            return response()->json(['message' => 'Session expirée. Veuillez vous reconnecter.'], 401);
        }

        $user = User::find($userId);

        if (!$user || !$user->two_factor_secret) {
            return response()->json(['message' => 'Configuration 2FA introuvable.'], 422);
        }

        $google2fa = new Google2FA();
        $secret    = decrypt($user->two_factor_secret);

        if (!$google2fa->verifyKey($secret, $request->code)) {
            SecurityLog::create([
                'user_id'       => $user->id,
                'event_type'    => '2fa_failed',
                'resource_name' => 'user',
                'resource_id'   => (string) $user->id,
                'ip_address'    => $request->ip(),
            ]);

            return response()->json(['message' => 'Code invalide. Vérifiez votre application d\'authentification.'], 422);
        }

        // Code valide → supprimer le token temporaire et créer le token Sanctum
        Cache::forget("2fa_pending:{$request->pending_token}");
        $user->tokens()->delete();
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user'  => $this->formatUser($user),
            'token' => $token,
        ]);
    }

    // ── 2FA — Configuration ───────────────────────────────────────────────

    /**
     * POST /api/auth/admin/setup-2fa
     * Génère un secret TOTP et retourne le QR code (avant confirmation)
     */
    public function sendAdmin2FA(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $google2fa = new Google2FA();
        $secret    = $google2fa->generateSecretKey();

        // Stocker le secret (chiffré) sans encore activer la 2FA
        $user->update([
            'two_factor_secret'       => encrypt($secret),
            'two_factor_enabled'      => false,
            'two_factor_confirmed_at' => null,
        ]);

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            'CYNA',
            $user->email,
            $secret
        );

        // Générer le QR code en SVG base64
        $renderer = new ImageRenderer(
            new RendererStyle(300),
            new SvgImageBackEnd()
        );
        $writer   = new Writer($renderer);
        $svg      = $writer->writeString($qrCodeUrl);
        $qrCode   = 'data:image/svg+xml;base64,' . base64_encode($svg);

        return response()->json([
            'message'    => 'Scannez ce QR code avec Google Authenticator.',
            'qr_code'    => $qrCode,
            'secret_key' => $secret,
        ]);
    }

    /**
     * POST /api/auth/admin/confirm-2fa
     * Confirme l'activation de la 2FA avec le premier code TOTP
     */
    public function confirmAdmin2FA(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        if (!$user->two_factor_secret) {
            return response()->json(['message' => 'Lancez d\'abord la configuration (POST /admin/setup-2fa).'], 422);
        }

        $google2fa = new Google2FA();
        $secret    = decrypt($user->two_factor_secret);

        if (!$google2fa->verifyKey($secret, $request->code)) {
            SecurityLog::create([
                'user_id'       => $user->id,
                'event_type'    => '2fa_setup_failed',
                'resource_name' => 'user',
                'resource_id'   => (string) $user->id,
                'ip_address'    => $request->ip(),
            ]);

            return response()->json(['message' => 'Code invalide. Assurez-vous que l\'heure de votre appareil est correcte.'], 422);
        }

        $user->update([
            'two_factor_enabled'      => true,
            'two_factor_confirmed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Authentification à deux facteurs activée avec succès.',
        ]);
    }

    /**
     * DELETE /api/auth/admin/disable-2fa
     * Désactive la 2FA (requiert le code TOTP courant)
     */
    public function disableAdmin2FA(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        if (!$user->two_factor_enabled || !$user->two_factor_secret) {
            return response()->json(['message' => 'La 2FA n\'est pas activée sur ce compte.'], 422);
        }

        $google2fa = new Google2FA();
        $secret    = decrypt($user->two_factor_secret);

        if (!$google2fa->verifyKey($secret, $request->code)) {
            SecurityLog::create([
                'user_id'       => $user->id,
                'event_type'    => '2fa_disable_failed',
                'resource_name' => 'user',
                'resource_id'   => (string) $user->id,
                'ip_address'    => $request->ip(),
            ]);

            return response()->json(['message' => 'Code invalide.'], 422);
        }

        $user->update([
            'two_factor_enabled'      => false,
            'two_factor_secret'       => null,
            'two_factor_confirmed_at' => null,
        ]);

        return response()->json([
            'message' => 'Authentification à deux facteurs désactivée.',
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private function formatUser(User $user): array
    {
        return [
            'id'                 => $user->id,
            'first_name'         => $user->first_name,
            'last_name'          => $user->last_name,
            'email'              => $user->email,
            'company'            => $user->company,
            'siren'              => $user->siren,
            'role'               => $user->role,
            'two_factor_enabled' => $user->two_factor_enabled && $user->two_factor_confirmed_at !== null,
        ];
    }
}
