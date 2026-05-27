"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {
  Users, Clock, Zap, DollarSign, TrendingUp, Activity,
  Star, UserPlus, Scissors, Award
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const GOLD = "#d4af37";
const COLORS = ["#d4af37", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard');
      return data;
    },
    refetchInterval: 15000,
  });

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-slate-400 text-sm">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Receitas", value: stats.receitasMes },
    { name: "Despesas", value: stats.despesasMes },
  ];

  const lucro = stats.receitasMes - stats.despesasMes;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Analytics
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full uppercase tracking-widest border border-primary/30">
              Premium
            </span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Visão geral do negócio em tempo real.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-xl border border-emerald-400/20">
          <Activity className="w-4 h-4 animate-pulse" /> Ao Vivo · Atualiza a cada 15s
        </div>
      </div>

      {/* ── Cards de Métricas ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Users className="w-5 h-5 text-blue-400" />} label="Fila Ativa" value={stats.filaAtiva.toString()} subtext="aguardando agora" color="blue" />
        <MetricCard icon={<DollarSign className="w-5 h-5 text-emerald-400" />} label="Faturamento Hoje" value={`R$ ${stats.revenueToday.toFixed(2)}`} subtext={`${stats.totalAtendimentos} atendimentos`} color="emerald" />
        <MetricCard icon={<Clock className="w-5 h-5 text-amber-400" />} label="TMA Geral" value={`${stats.averageServiceTime} min`} subtext="tempo médio de atendimento" color="amber" />
        <MetricCard icon={<UserPlus className="w-5 h-5 text-purple-400" />} label="Clientes Totais" value={stats.totalClientes.toString()} subtext={`+${stats.clientesNovosHoje} hoje`} color="purple" />
      </div>

      {/* ── Linha 2: Gráficos Principais ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Atendimentos por hora */}
        <div className="lg:col-span-2 glass-panel border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Scissors className="w-4 h-4 text-primary" /> Atendimentos por Hora — Hoje
          </h3>
          <p className="text-xs text-slate-500 mb-5">Volume de atendimentos ao longo do dia</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.hourlyData}>
                <defs>
                  <linearGradient id="gradGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} itemStyle={{ color: GOLD }} />
                <Area type="monotone" dataKey="atendimentos" stroke={GOLD} strokeWidth={2.5} fillOpacity={1} fill="url(#gradGold)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receitas vs Despesas — Mês */}
        <div className="glass-panel border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Mês Atual
          </h3>
          <p className="text-xs text-slate-500 mb-4">Receitas x Despesas</p>
          <div className="h-36 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={i === 0 ? '#10b981' : '#ef4444'} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `R$ ${Number(v).toFixed(2)}`} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Receitas</span>
              <span className="text-white font-bold">R$ {stats.receitasMes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Despesas</span>
              <span className="text-white font-bold">R$ {stats.despesasMes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-white/10">
              <span className="text-slate-400">Lucro</span>
              <span className={`font-black ${lucro >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>R$ {lucro.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Linha 3: Faturamento 7 dias ── */}
      <div className="glass-panel border border-white/10 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" /> Faturamento — Últimos 7 Dias
        </h3>
        <p className="text-xs text-slate-500 mb-5">Receitas diárias confirmadas</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.last7Days} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                formatter={(v: any) => [`R$ ${Number(v).toFixed(2)}`, "Faturamento"]}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: GOLD }}
              />
              <Bar dataKey="faturamento" fill={GOLD} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Linha 4: Ranking Barbeiros + Métricas Extra ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Ranking de Barbeiros */}
        <div className="glass-panel border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" /> Ranking de Barbeiros — Hoje
          </h3>
          {stats.barberRanking.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Nenhum atendimento hoje ainda.</p>
          ) : (
            <div className="space-y-3">
              {stats.barberRanking.map((b: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-slate-900/40 rounded-xl p-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-slate-400 text-black' : 'bg-amber-700 text-white'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{b.name}</p>
                    <p className="text-xs text-slate-400">{b.atendimentos} atendimentos · TMA {b.tma}min</p>
                  </div>
                  {b.rating && (
                    <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-yellow-400" />
                      {b.rating}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Métricas extras */}
        <div className="glass-panel border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Indicadores Chave
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-slate-400 text-sm">Barbeiro mais rápido</span>
              <span className="text-white font-bold text-sm">{stats.fastestBarber}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-slate-400 text-sm">Avaliação média</span>
              <span className="flex items-center gap-1 font-bold text-sm">
                {stats.averageRating ? (
                  <><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /><span className="text-white">{stats.averageRating}</span></>
                ) : <span className="text-slate-500">Sem avaliações</span>}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-slate-400 text-sm">Clientes totais</span>
              <span className="text-white font-bold text-sm">{stats.totalClientes}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400 text-sm">Novos clientes hoje</span>
              <span className="text-emerald-400 font-bold text-sm">+{stats.clientesNovosHoje}</span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500 mb-1">BarberFlow Premium SaaS</p>
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold border border-primary/20">
              ✅ Todas as automações ativas
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function MetricCard({ icon, label, value, subtext, color }: { icon: React.ReactNode; label: string; value: string; subtext: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500/20 hover:border-blue-500/40',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40',
    amber: 'border-amber-500/20 hover:border-amber-500/40',
    purple: 'border-purple-500/20 hover:border-purple-500/40',
  };
  return (
    <div className={`glass-panel border ${colorMap[color] || 'border-white/10'} rounded-2xl p-4 md:p-5 transition-all hover:scale-[1.02] group`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="font-medium text-slate-400 text-xs">{label}</h3>
      </div>
      <div className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1 truncate">{value}</div>
      <p className="text-xs font-medium text-slate-500">{subtext}</p>
    </div>
  );
}
