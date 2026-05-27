"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { 
  Users, 
  Clock, 
  Zap, 
  DollarSign, 
  TrendingUp,
  Activity
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard');
      return data;
    },
    refetchInterval: 10000, // Atualiza a cada 10s
  });

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Dashboard <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full uppercase tracking-widest border border-primary/30">Admin Pro</span>
          </h1>
          <p className="text-slate-400 mt-1">Visão geral do negócio em tempo real.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-xl border border-emerald-400/20">
          <Activity className="w-4 h-4 animate-pulse" /> Ao Vivo
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          icon={<Users className="w-6 h-6 text-blue-400" />}
          label="Fila Ativa"
          value={stats.filaAtiva.toString()}
          subtext="Clientes aguardando"
        />
        <MetricCard 
          icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
          label="Faturamento do Dia"
          value={`R$ ${stats.revenueToday.toFixed(2)}`}
          subtext={`${stats.totalAtendimentos} concluídos hoje`}
        />
        <MetricCard 
          icon={<Clock className="w-6 h-6 text-amber-400" />}
          label="TMA Geral"
          value={`${stats.averageServiceTime} min`}
          subtext="Tempo Médio de Atendimento"
        />
        <MetricCard 
          icon={<Zap className="w-6 h-6 text-purple-400" />}
          label="Barbeiro mais rápido"
          value={stats.fastestBarber}
          subtext="Menor TMA do dia"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 glass-panel border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Fluxo de Atendimentos
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.hourlyData}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#d4af37' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="atendimentos" 
                  stroke="#d4af37" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrimary)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Avisos do Sistema</h3>
            <div className="flex flex-col gap-3">
              <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 mb-1">Status da Fila</p>
                <strong className="text-emerald-400">Online & Operante</strong>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 mb-1">WhatsApp Bot</p>
                <strong className="text-emerald-400">Conectado</strong>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-500 mb-2">BarberFlow Premium SaaS V3</p>
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">
              Todas as automações ativas
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function MetricCard({ icon, label, value, subtext }: { icon: React.ReactNode, label: string, value: string, subtext: string }) {
  return (
    <div className="glass-panel border border-white/10 rounded-2xl p-5 hover:border-primary/50 transition-colors group">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="font-semibold text-slate-300">{label}</h3>
      </div>
      <div className="text-3xl font-black text-white tracking-tight mb-1">{value}</div>
      <p className="text-xs font-medium text-slate-500">{subtext}</p>
    </div>
  );
}
