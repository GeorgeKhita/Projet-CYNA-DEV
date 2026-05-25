import { Outlet } from 'react-router';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CookieBanner } from './CookieBanner';
import { ChatBot } from './ChatBot';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A1628]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
      <ChatBot />
    </div>
  );
}
