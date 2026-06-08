import { useRouteError, Link } from 'react-router';

export function ErrorBoundary() {
  const error = useRouteError() as any;
  const message = error?.message || error?.statusText || 'Une erreur inattendue est survenue.';

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-white mb-3">Oups !</h1>
        <p className="text-gray-400 mb-8">{message}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors">
            Recharger la page
          </button>
          <Link to="/"
            className="px-6 py-3 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/5 transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
