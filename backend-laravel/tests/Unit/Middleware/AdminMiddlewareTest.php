<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\AdminMiddleware;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Tests\TestCase;

class AdminMiddlewareTest extends TestCase
{
    private AdminMiddleware $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new AdminMiddleware();
    }

    private function nextReturning200(): \Closure
    {
        return fn(Request $r) => response()->json(['ok' => true], 200);
    }

    // ── Accès refusé ──────────────────────────────────────────────────────

    public function test_rejects_unauthenticated_request(): void
    {
        $request = new Request();
        // Pas d'utilisateur → user() retourne null
        $request->setUserResolver(fn() => null);

        $response = $this->middleware->handle($request, $this->nextReturning200());

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(403, $response->getStatusCode());
    }

    public function test_rejects_user_with_role_user(): void
    {
        $request = new Request();
        $request->setUserResolver(fn() => new User(['role' => 'user']));

        $response = $this->middleware->handle($request, $this->nextReturning200());

        $this->assertSame(403, $response->getStatusCode());
    }

    public function test_rejects_user_with_empty_role(): void
    {
        $request = new Request();
        $request->setUserResolver(fn() => new User(['role' => '']));

        $response = $this->middleware->handle($request, $this->nextReturning200());

        $this->assertSame(403, $response->getStatusCode());
    }

    public function test_403_response_contains_message(): void
    {
        $request = new Request();
        $request->setUserResolver(fn() => null);

        $response = $this->middleware->handle($request, $this->nextReturning200());
        $data     = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('message', $data);
        $this->assertNotEmpty($data['message']);
    }

    // ── Accès autorisé ────────────────────────────────────────────────────

    public function test_allows_admin_user_through(): void
    {
        $request = new Request();
        $request->setUserResolver(fn() => new User(['role' => 'admin']));

        $response = $this->middleware->handle($request, $this->nextReturning200());

        $this->assertSame(200, $response->getStatusCode());
    }

    public function test_next_is_called_for_admin(): void
    {
        $request = new Request();
        $request->setUserResolver(fn() => new User(['role' => 'admin']));

        $called   = false;
        $next     = function (Request $r) use (&$called) {
            $called = true;
            return response()->json(['ok' => true]);
        };

        $this->middleware->handle($request, $next);
        $this->assertTrue($called);
    }

    public function test_next_is_not_called_for_non_admin(): void
    {
        $request = new Request();
        $request->setUserResolver(fn() => new User(['role' => 'user']));

        $called = false;
        $next   = function (Request $r) use (&$called) {
            $called = true;
            return response()->json(['ok' => true]);
        };

        $this->middleware->handle($request, $next);
        $this->assertFalse($called);
    }
}
