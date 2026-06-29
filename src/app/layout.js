import './globals.css';
import Sidebar from '../components/Sidebar.js';
import TopBar from '../components/TopBar.js';

export const metadata = {
  title: 'Shorty War Room',
  description: 'Commission tracking, P&L, and personal command dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="flex h-screen overflow-hidden antialiased" style={{ background: 'var(--crm-bg)' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
