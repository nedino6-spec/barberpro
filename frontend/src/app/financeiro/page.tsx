"use client";

import { useEffect, useState } from "react";
import { DollarSign, ArrowUpRight, ArrowDownRight, Plus, Filter, Wallet, Lock, Unlock, TrendingUp } from "lucide-react";
import { NovaMovimentacaoModal } from "@/components/financeiro/NovaMovimentacaoModal";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";


export default function FinanceiroPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [register, setRegister] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, transRes, regRes] = await Promise.all([
        fetch("/api/finance/dashboard"),
        fetch("/api/finance/transactions"),
        fetch("/api/finance/register")
      ]);
      
      if (dashRes.ok) setDashboard(await dashRes.json());
      if (transRes.ok) setTransactions(await transRes.json());
      if (regRes.ok) {
        const regData = await regRes.json();
        setRegister(regData.register);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterAction = async (action: "OPEN" | "CLOSE") => {
    const confirmMessage = action === "OPEN" ? "Deseja abrir o caixa?" : "Deseja fechar o caixa e encerrar o dia?";
    if (!confirm(confirmMessage)) return;

    try {
      const res = await fetch("/api/finance/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        alert(`Caixa ${action === "OPEN" ? "aberto" : "fechado"} com sucesso!`);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao realizar ação");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão");
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')} - ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-white drop-shadow-md">
            <Wallet className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" /> Financeiro
          </h1>
          <p className="text-slate-300 mt-1 text-sm">Controle de caixa e faturamento empresarial.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {register ? (
            <button onClick={() => handleRegisterAction("CLOSE")} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors backdrop-blur-sm">
              <Lock className="w-4 h-4" /> Fechar Caixa
            </button>
          ) : (
            <button onClick={() => handleRegisterAction("OPEN")} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition-colors backdrop-blur-sm">
              <Unlock className="w-4 h-4" /> Abrir Caixa
            </button>
          )}
          <button onClick={() => setIsModalOpen(true)} className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white border-t border-emerald-400/30 rounded-xl text-sm font-medium hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Nova Movimentação
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-card relative overflow-hidden group hover:border-emerald-500/30">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-l-2xl"></div>
          <div className="flex items-center gap-4 pl-2 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entradas (Mês)</p>
              <h3 className="text-2xl font-bold text-white mt-0.5 glow-text">{formatMoney(dashboard?.totalIncome)}</h3>
            </div>
          </div>
        </div>
        
        <div className="glass-card relative overflow-hidden group hover:border-red-500/30">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 rounded-l-2xl"></div>
          <div className="flex items-center gap-4 pl-2 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saídas (Mês)</p>
              <h3 className="text-2xl font-bold text-white mt-0.5 glow-text">{formatMoney(dashboard?.totalExpense)}</h3>
            </div>
          </div>
        </div>

        <div className="glass-card relative overflow-hidden group hover:border-blue-500/30">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-2xl"></div>
          <div className="flex items-center gap-4 pl-2 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo do Mês</p>
              <h3 className="text-2xl font-bold text-white mt-0.5 glow-text">{formatMoney(dashboard?.balance)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gráfico Receitas x Despesas ── */}
      {dashboard?.monthlyTrend && dashboard.monthlyTrend.length > 0 && (
        <div className="glass-panel border border-white/10 rounded-2xl p-5">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Receitas x Despesas — Últimos 30 dias
          </h3>
          <p className="text-xs text-slate-500 mb-4">Comparativo diário de entradas e saídas</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.monthlyTrend} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  formatter={(v: any, name: string) => [`R$ ${Number(v).toFixed(2)}`, name === 'receitas' ? 'Entradas' : 'Saídas']}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend formatter={(v) => v === 'receitas' ? 'Entradas' : 'Saídas'} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="glass-panel rounded-2xl p-4 md:p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Histórico Recente</h2>
          <button className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>

        
        {loading ? (
          <div className="text-center py-8 text-slate-500 animate-pulse">Carregando dados financeiros...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Nenhuma movimentação registrada.</div>
        ) : (
          <>
            {/* Mobile View (Cards) */}
            <div className="md:hidden flex flex-col gap-3">
              {transactions.map((t) => (
                <div key={t.id} className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${t.type === 'INCOME' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                      {t.type === 'INCOME' ? 'Entrada' : 'Saída'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{formatDate(t.date)}</span>
                  </div>
                  <div className="font-bold text-white mt-1">{t.description}</div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                    <span className="text-xs text-slate-400 font-medium uppercase">{t.paymentMethod}</span>
                    <span className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.type === 'INCOME' ? '+' : '-'} {formatMoney(t.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-sm">
                    <th className="py-3 px-4 font-medium">Data</th>
                    <th className="py-3 px-4 font-medium">Descrição</th>
                    <th className="py-3 px-4 font-medium">Tipo</th>
                    <th className="py-3 px-4 font-medium">Pagamento</th>
                    <th className="py-3 px-4 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-white">
                      <td className="py-4 px-4 text-sm text-slate-400">{formatDate(t.date)}</td>
                      <td className="py-4 px-4 font-medium">{t.description}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${t.type === 'INCOME' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                          {t.type === 'INCOME' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">{t.paymentMethod}</td>
                      <td className={`py-4 px-4 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.type === 'INCOME' ? '+' : '-'} {formatMoney(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <NovaMovimentacaoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchData} 
      />
    </div>
  );
}
