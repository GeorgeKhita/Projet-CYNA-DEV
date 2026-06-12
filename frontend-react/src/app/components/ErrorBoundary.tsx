import { useRouteError, Link } from 'react-router';

export function ErrorBoundary() {
  const error = useRouteError() as any;
  const message = error?.message || error?.statusText || 'Une erreur inattendue est survenue.';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F8FB] to-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">âš ï¸</div>
        <h1 className="text-3xl font-bold text-ink mb-3">Oups !</h1>
        <p className="text-muted-foreground mb-8">{message}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Recharger la page
          </button>
          <Link to="/" className="btn btn-ghost">
            Retour Ã  l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
