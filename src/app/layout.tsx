import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarberPro",
  description: "Sistema Inteligente para Barbearias",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BarberPro",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="dashboard-layout">
          {/* Sidebar Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-logo">
              ✂️ <span>BarberPro</span>
            </div>
            
            <nav className="flex flex-col gap-2">
              <a href="/" className="nav-item active">
                <span>📊</span> Dashboard
              </a>
              <a href="/agenda" className="nav-item">
                <span>📅</span> Agenda
              </a>
              <a href="/fila" className="nav-item">
                <span>🚶‍♂️</span> Fila Virtual
              </a>
              <a href="/clientes" className="nav-item">
                <span>👥</span> Clientes
              </a>
              <a href="/servicos" className="nav-item">
                <span>✂️</span> Serviços
              </a>
              <a href="/financeiro" className="nav-item">
                <span>💰</span> Financeiro
              </a>
              <a href="/configuracoes/whatsapp" className="nav-item">
                <span>📱</span> WhatsApp Bot
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-secondary" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Bem-vindo de volta!</h2>
              </div>
              <div className="flex items-center gap-4">
                <button className="btn btn-secondary">🔔 Notificações</button>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
              </div>
            </header>
            
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
