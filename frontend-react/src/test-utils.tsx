import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from './context/AuthContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialPath?: string;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { initialPath = '/', ...options }: CustomRenderOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    );
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

/** Simule un utilisateur connecté en pré-remplissant localStorage */
export function setAuthUser(
  user = { id: 1, first_name: 'Nouh', last_name: 'M', email: 'nouh@cyna.fr', role: 'user' as const },
  token = 'test-token',
) {
  localStorage.setItem('cyna_token', token);
  localStorage.setItem('cyna_user', JSON.stringify(user));
}

export { setAuthUser as loginAs };
export * from '@testing-library/react';
