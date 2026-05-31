<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'required|email|unique:users,email',
            'password'   => ['required', 'confirmed', Password::min(8)],
            'company'    => 'nullable|string|max:200',
            'phone'      => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email'      => $data['email'],
            'password'   => Hash::make($data['password']),
            'company'    => $data['company'] ?? null,
            'phone'      => $data['phone'] ?? null,
            'role'       => 'user',
            'is_active'  => true,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        ActivityLog::record($user->id, 'register', "Inscription: {$user->email}", $request->ip());

        return response()->json([
            'user'  => $this->formatUser($user),
            'token' => $token,
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Compte désactivé. Contactez l\'administrateur.'], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('api-token')->plainTextToken;

        ActivityLog::record($user->id, 'login', "Connexion réussie: {$user->email}", $request->ip());

        return response()->json([
            'user'  => $this->formatUser($user),
            'token' => $token,
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        ActivityLog::record($user->id, 'logout', "Déconnexion: {$user->email}", $request->ip());
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($this->formatUser($request->user()));
    }

    /**
     * PUT /api/auth/me
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'first_name'       => 'sometimes|string|max:100',
            'last_name'        => 'sometimes|string|max:100',
            'email'            => 'sometimes|email|unique:users,email,' . $user->id,
            'company'          => 'nullable|string|max:200',
            'phone'            => 'nullable|string|max:20',
            'current_password' => 'required_with:password|string',
            'password'         => 'nullable|string|min:8|confirmed',
        ]);

        if (isset($data['current_password'])) {
            if (! Hash::check($data['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Mot de passe actuel incorrect.'],
                ]);
            }
            if (isset($data['password'])) {
                $user->password = Hash::make($data['password']);
            }
        }

        $fillable = \Arr::except($data, ['current_password', 'password', 'password_confirmation']);
        $user->fill($fillable);
        $user->save();

        return response()->json($this->formatUser($user));
    }

    /**
     * POST /api/auth/forgot-password
     * Génère un token de réinitialisation et l'envoie par email
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // Toujours retourner 200 pour éviter l'énumération d'emails
        if (! $user) {
            return response()->json([
                'message' => 'Si cet email existe, un lien de réinitialisation vous a été envoyé.',
            ]);
        }

        // Générer un token sécurisé
        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        // Construire le lien de réinitialisation
        $resetUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/')
            . '/reinitialiser-mot-de-passe?token=' . $token
            . '&email=' . urlencode($request->email);

        // Envoyer l'email (loggé dans storage/logs/laravel.log si MAIL_MAILER=log)
        Mail::send([], [], function ($message) use ($user, $resetUrl) {
            $message->to($user->email, $user->full_name)
                ->subject('Réinitialisation de votre mot de passe CYNA')
                ->html(
                    "<p>Bonjour {$user->first_name},</p>"
                    . "<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>"
                    . "<p><a href=\"{$resetUrl}\" style=\"background:#00B4D8;color:#0A1628;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;\">Réinitialiser mon mot de passe</a></p>"
                    . "<p>Ce lien expire dans 60 minutes.</p>"
                    . "<p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>"
                    . "<p>— L'équipe CYNA</p>"
                );
        });

        ActivityLog::record($user->id, 'password_reset_request', "Demande reset mdp: {$user->email}", $request->ip());

        return response()->json([
            'message' => 'Si cet email existe, un lien de réinitialisation vous a été envoyé.',
        ]);
    }

    /**
     * POST /api/auth/reset-password
     * Vérifie le token et change le mot de passe
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Token invalide ou expiré.'], 422);
        }

        // Token expire après 60 minutes
        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Ce lien de réinitialisation a expiré.'], 422);
        }

        if (! Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Token invalide ou expiré.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        if (! $user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Supprimer le token utilisé
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Révoquer tous les tokens actifs
        $user->tokens()->delete();

        ActivityLog::record($user->id, 'password_reset', "Mot de passe réinitialisé: {$user->email}", $request->ip());

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.']);
    }

    /**
     * POST /api/auth/admin/send-2fa
     * Génère et envoie un code OTP 6 chiffres à l'admin connecté
     */
    public function sendAdmin2FA(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->update([
            'two_factor_code'       => Hash::make($code),
            'two_factor_expires_at' => now()->addMinutes(5),
        ]);

        // Envoyer le code par email (loggé dans storage/logs/laravel.log si MAIL_MAILER=log)
        Mail::send([], [], function ($message) use ($user, $code) {
            $message->to($user->email, $user->full_name)
                ->subject('Code de vérification CYNA Admin — ' . $code)
                ->html(
                    "<p>Bonjour {$user->first_name},</p>"
                    . "<p>Votre code de vérification pour l'accès au panel d'administration CYNA est :</p>"
                    . "<h1 style=\"font-size:48px;letter-spacing:12px;color:#00B4D8;font-family:monospace;\">{$code}</h1>"
                    . "<p>Ce code est valide pendant <strong>5 minutes</strong>.</p>"
                    . "<p>Si vous n'êtes pas à l'origine de cette connexion, contactez immédiatement votre administrateur système.</p>"
                    . "<p>— L'équipe CYNA</p>"
                );
        });

        ActivityLog::record($user->id, 'admin_2fa_sent', "Code 2FA envoyé à: {$user->email}", $request->ip());

        return response()->json(['message' => 'Code 2FA envoyé par email.']);
    }

    /**
     * POST /api/auth/admin/verify-2fa
     * Vérifie le code OTP 2FA de l'admin
     */
    public function verifyAdmin2FA(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string|size:6']);

        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        if (! $user->two_factor_code || ! $user->two_factor_expires_at) {
            return response()->json(['message' => 'Aucun code 2FA en attente. Recommencez la connexion.'], 422);
        }

        if (now()->isAfter($user->two_factor_expires_at)) {
            $user->update(['two_factor_code' => null, 'two_factor_expires_at' => null]);
            return response()->json(['message' => 'Code 2FA expiré. Recommencez la connexion.'], 422);
        }

        if (! Hash::check($request->code, $user->two_factor_code)) {
            return response()->json(['message' => 'Code 2FA incorrect.'], 422);
        }

        // Invalider le code après utilisation
        $user->update(['two_factor_code' => null, 'two_factor_expires_at' => null]);

        ActivityLog::record($user->id, 'admin_2fa_verified', "Connexion admin 2FA validée: {$user->email}", $request->ip());

        return response()->json(['message' => '2FA vérifié.', 'verified' => true]);
    }

    /**
     * GET /api/auth/me/export
     * Export RGPD — toutes les données personnelles de l'utilisateur
     */
    public function exportMyData(Request $request): Response
    {
        $user = $request->user()->load(['orders.items.product', 'subscriptions.product', 'invoices', 'activityLogs']);

        $data = [
            'export_date' => now()->toIso8601String(),
            'profil'      => [
                'id'         => $user->id,
                'prenom'     => $user->first_name,
                'nom'        => $user->last_name,
                'email'      => $user->email,
                'entreprise' => $user->company,
                'telephone'  => $user->phone,
                'role'       => $user->role,
                'actif'      => $user->is_active,
                'inscription' => $user->created_at,
            ],
            'commandes' => $user->orders->map(fn($o) => [
                'id'         => $o->id,
                'statut'     => $o->status,
                'total'      => $o->total_amount,
                'date'       => $o->created_at,
                'produits'   => $o->items->map(fn($i) => [
                    'produit'  => $i->product?->name,
                    'prix'     => $i->price,
                    'plan'     => $i->plan,
                ]),
            ]),
            'abonnements' => $user->subscriptions->map(fn($s) => [
                'produit'             => $s->product?->name,
                'plan'                => $s->plan,
                'statut'              => $s->status,
                'prochain_paiement'   => $s->next_billing_date,
            ]),
            'factures' => $user->invoices->map(fn($i) => [
                'numero'  => $i->invoice_number,
                'montant' => $i->amount,
                'statut'  => $i->status,
                'date'    => $i->created_at,
            ]),
            'historique_connexions' => $user->activityLogs
                ->whereIn('action', ['login', 'logout', 'register'])
                ->map(fn($l) => [
                    'action'  => $l->action,
                    'ip'      => $l->ip_address,
                    'date'    => $l->created_at,
                ]),
        ];

        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        ActivityLog::record($user->id, 'rgpd_export', "Export RGPD: {$user->email}", $request->ip());

        return response($json, 200, [
            'Content-Type'        => 'application/json; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="mes-donnees-cyna-' . now()->format('Y-m-d') . '.json"',
        ]);
    }

    // ── Private ───────────────────────────────────────────────────────────

    private function formatUser(User $user): array
    {
        return [
            'id'         => $user->id,
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
            'email'      => $user->email,
            'company'    => $user->company,
            'phone'      => $user->phone ?? null,
            'role'       => $user->role,
            'is_active'  => $user->is_active,
            'created_at' => $user->created_at,
        ];
    }
}
