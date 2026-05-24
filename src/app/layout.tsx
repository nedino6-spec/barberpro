import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomTabs } from "@/components/ui/BottomTabs";
import { Bell, User } from "lucide-react";
import Link from "next/link";
import Providers from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BarberPro",
  description: "Sistema Inteligente para Barbearias",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BarberPro",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-background text-foreground overflow-hidden`}>
        <Providers>
          <div className="flex h-screen w-full">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border p-6 h-full">
              <div className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
              ✂️ <span className="text-primary">BarberPro</span>
            </div>
            
            <nav className="flex flex-col gap-2">
              <Link href="/" className="nav-item active">📊 Dashboard</Link>
              <Link href="/caixa" className="nav-item">💳 Frente de Caixa</Link>
              <Link href="/agenda" className="nav-item">📅 Agenda</Link>
              <Link href="/financeiro" className="nav-item">💰 Financeiro</Link>
              <Link href="/estoque" className="nav-item">📦 Estoque</Link>
              <Link href="/fila" className="nav-item">🚶‍♂️ Fila Virtual</Link>
              <Link href="/clientes" className="nav-item">👥 Clientes</Link>
              <Link href="/servicos" className="nav-item">✂️ Serviços</Link>
              <Link href="/configuracoes/whatsapp" className="nav-item">📱 WhatsApp Bot</Link>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex flex-col flex-1 h-full relative">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40">
              <div className="text-lg font-bold text-white flex items-center gap-2">
                ✂️ <span className="text-primary">BarberPro</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm text-white">
                  A
                </div>
              </div>
            </header>

            {/* Desktop Header */}
            <header className="hidden md:flex justify-between items-center p-8 pb-0">
              <div>
                <h2 className="text-muted-foreground font-medium">Bem-vindo de volta!</h2>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-bg-tertiary transition-colors">
                  <Bell className="w-4 h-4" /> Notificações
                </button>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white">
                  A
                </div>
              </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
              {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomTabs />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
