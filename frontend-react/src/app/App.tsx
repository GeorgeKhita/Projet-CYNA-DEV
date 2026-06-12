import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from './providers/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}