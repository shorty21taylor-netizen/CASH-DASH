import './globals.css';
import Nav from '../components/Nav.js';

export const metadata = {
  title: 'Summit Command Center',
  description: 'Commission tracking & personal life OS',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen overflow-hidden bg-dark-950 text-white">
        <Nav />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
