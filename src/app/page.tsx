"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Users, TrendingUp, Calendar as CalendarIcon, Crown } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-10">
      
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-black text-foreground mb-2">Visão Geral</h1>
        <p className="text-muted-foreground text-sm">Acompanhe as métricas de crescimento da sua Barbearia.</p>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-gradient-to-br from-card to-bg-tertiary border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-success/5 rounded-bl-full group-hover:bg-success/10 transition-colors"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-success/10 p-3 rounded-xl border border-success/20">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Faturamento (7d)</p>
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">R$ {(stats?.totalRevenue7Days || 0).toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-card to-bg-tertiary border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
              <CalendarIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Agendamentos Hoje</p>
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{stats?.todayAppointments || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-card to-bg-tertiary border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-yellow-500/50 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-500/5 rounded-bl-full group-hover:bg-yellow-500/10 transition-colors"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
              <Crown className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clube da Barba</p>
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{stats?.activeSubscriptions || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-card to-bg-tertiary border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-full group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clientes Base</p>
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{stats?.totalCustomers || 0}</p>
        </div>

      </div>

      {/* Gráfico Principal */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Faturamento dos Últimos 7 Dias
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#4ade80', fontWeight: 'bold' }}
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#4ade80" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, fill: '#4ade80', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/caixa" className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary transition-all flex items-center gap-4 group">
          <div className="bg-bg-tertiary w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <TrendingUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h3 className="font-bold">Abrir PDV</h3>
            <p className="text-xs text-muted-foreground">Frente de caixa rápido</p>
          </div>
        </Link>
        <Link href="/agenda" className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary transition-all flex items-center gap-4 group">
          <div className="bg-bg-tertiary w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <CalendarIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h3 className="font-bold">Agendamentos</h3>
            <p className="text-xs text-muted-foreground">Gerenciar horários</p>
          </div>
        </Link>
        <Link href="/clientes" className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary transition-all flex items-center gap-4 group">
          <div className="bg-bg-tertiary w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Users className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h3 className="font-bold">Clientes VIP</h3>
            <p className="text-xs text-muted-foreground">Clube da Barba & Fidelidade</p>
          </div>
        </Link>
      </div>

    </div>
  );
}
