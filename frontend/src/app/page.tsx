"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Users, TrendingUp, Calendar as CalendarIcon, Crown, Clock, XCircle, UserX, Activity } from "lucide-react";
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
        <h1 className="text-3xl font-black text-white drop-shadow-md mb-2">Visão Geral</h1>
        <p className="text-slate-300 text-sm">Acompanhe as métricas de crescimento da sua Barbearia.</p>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="glass-card relative overflow-hidden group hover:border-emerald-500/30">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full group-hover:bg-emerald-500/20 transition-all blur-md"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faturamento (7d)</p>
            </div>
          </div>
          <p className="text-3xl font-black text-white glow-text relative z-10">R$ {(stats?.totalRevenue7Days || 0).toFixed(2)}</p>
        </div>

        <div className="glass-card relative overflow-hidden group hover:border-blue-500/30">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-bl-full group-hover:bg-blue-500/20 transition-all blur-md"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <CalendarIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agendamentos / Atendimentos (Hoje)</p>
            </div>
          </div>
          <p className="text-3xl font-black text-white glow-text relative z-10">{stats?.todayAppointments || 0}</p>
        </div>

        <div className="glass-card relative overflow-hidden group hover:border-amber-500/30">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-bl-full group-hover:bg-amber-500/20 transition-all blur-md"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clube da Barba</p>
            </div>
          </div>
          <p className="text-3xl font-black text-white glow-text relative z-10">{stats?.activeSubscriptions || 0}</p>
        </div>

        <div className="glass-card relative overflow-hidden group hover:border-purple-500/30">
          <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-bl-full group-hover:bg-purple-500/20 transition-all blur-md"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clientes Base</p>
            </div>
          </div>
          <p className="text-3xl font-black text-white glow-text relative z-10">{stats?.totalCustomers || 0}</p>
        </div>

      </div>

      {/* Métricas Fila Inteligente (Novas) */}
      <h2 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-md">
        <Activity className="w-5 h-5 text-primary" /> Fila Virtual
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="glass-card relative overflow-hidden group hover:border-amber-500/30">
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pessoas na Fila</p></div>
          </div>
          <p className="text-3xl font-black text-white relative z-10">{stats?.queueActive || 0}</p>
        </div>

        <div className="glass-card relative overflow-hidden group hover:border-primary/30">
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tempo Médio</p></div>
          </div>
          <p className="text-3xl font-black text-white relative z-10">~{stats?.avgWaitTime || 30}m</p>
        </div>

        <div className="glass-card relative overflow-hidden group hover:border-rose-500/30">
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              <XCircle className="w-6 h-6 text-rose-400" />
            </div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cancelamentos (Hoje)</p></div>
          </div>
          <p className="text-3xl font-black text-white relative z-10">{stats?.queueCancelledToday || 0}</p>
        </div>

        <div className="glass-card relative overflow-hidden group hover:border-orange-500/30">
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
              <UserX className="w-6 h-6 text-orange-400" />
            </div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ausentes (Hoje)</p></div>
          </div>
          <p className="text-3xl font-black text-white relative z-10">{stats?.queueAbsentToday || 0}</p>
        </div>

      </div>

      {/* Gráfico Principal */}
      <div className="glass-card p-6 md:p-8">
        <h2 className="font-bold text-lg mb-6 flex items-center gap-2 drop-shadow-sm">
          <TrendingUp className="w-5 h-5 text-emerald-400" /> Faturamento dos Últimos 7 Dias
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
                formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#34d399" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, fill: '#34d399', stroke: '#fff', strokeWidth: 2, className: "drop-shadow-md" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/caixa" className="glass-card flex items-center gap-4 group cursor-pointer hover:border-emerald-500/30">
          <div className="bg-white/5 border border-white/10 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all shadow-sm">
            <TrendingUp className="w-6 h-6 text-slate-300 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">Abrir PDV</h3>
            <p className="text-xs text-slate-400 mt-1">Frente de caixa rápido</p>
          </div>
        </Link>
        <Link href="/agenda" className="glass-card flex items-center gap-4 group cursor-pointer hover:border-blue-500/30">
          <div className="bg-white/5 border border-white/10 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all shadow-sm">
            <CalendarIcon className="w-6 h-6 text-slate-300 group-hover:text-blue-400 transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">Agendamentos</h3>
            <p className="text-xs text-slate-400 mt-1">Gerenciar horários</p>
          </div>
        </Link>
        <Link href="/clientes" className="glass-card flex items-center gap-4 group cursor-pointer hover:border-purple-500/30">
          <div className="bg-white/5 border border-white/10 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-all shadow-sm">
            <Users className="w-6 h-6 text-slate-300 group-hover:text-purple-400 transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">Clientes VIP</h3>
            <p className="text-xs text-slate-400 mt-1">Clube da Barba & Fidelidade</p>
          </div>
        </Link>
      </div>

    </div>
  );
}
