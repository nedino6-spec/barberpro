import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomTabs } from "@/components/ui/BottomTabs";
import { Bell, User } from "lucide-react";
import Link from "next/link";
import Providers from "@/components/providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Painel | BarberPro",
  description: "Sistema completo de gestão para barbearias de alto nível.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-miniatura.png",
    apple: "/logo-miniatura.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Painel",
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
    <html lang="pt-br">
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="preload" as="image" href="/logo-miniatura.png" />
      </head>
      <body className={`${inter.className} bg-background text-foreground overflow-hidden`}>
        {/* Animated Mesh Gradient Background */}
        <div className="mesh-bg">
          <div className="mesh-blob mesh-blob-1"></div>
          <div className="mesh-blob mesh-blob-2"></div>
          <div className="mesh-blob mesh-blob-3"></div>
        </div>
        
        <Toaster position="top-right" toastOptions={{ style: { background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(10px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
        <Providers>
          <div className="flex h-screen w-full relative z-10">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-white/5 p-6 h-full shadow-2xl">
              <div className="text-2xl font-bold text-white mb-8 flex items-center gap-2 drop-shadow-md">
              ✂️ <span className="text-blue-400 glow-text">BarberPro</span>
            </div>
            
            <nav className="flex flex-col gap-2">
              <Link href="/" className="nav-item active">📊 Visão Geral</Link>
              <Link href="/dashboard" className="nav-item text-primary font-bold">📈 SaaS Analytics</Link>
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
            <header className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-white/5 sticky top-0 z-40">
              <div className="text-lg font-bold text-white flex items-center gap-2 drop-shadow-md">
                ✂️ <span className="text-blue-400 glow-text">BarberPro</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 text-slate-300 hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)] flex items-center justify-center font-bold text-sm text-white border border-blue-400/50">
                  A
                </div>
              </div>
            </header>

            {/* Desktop Header */}
            <header className="hidden md:flex justify-between items-center p-8 pb-0">
              <div>
                <h2 className="text-slate-300 font-medium text-lg drop-shadow-sm">Bem-vindo de volta, Admin!</h2>
              </div>
              <div className="flex items-center gap-5">
                <button className="flex items-center gap-2 px-4 py-2.5 glass-panel rounded-xl text-sm hover:bg-white/10 transition-all font-medium text-slate-200">
                  <Bell className="w-4 h-4" /> Notificações
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center font-bold text-white border border-white/20">
                  A
                </div>
              </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
              {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden">
              <BottomTabs />
            </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
