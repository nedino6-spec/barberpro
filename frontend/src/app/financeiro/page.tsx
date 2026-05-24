"use client";

import { useEffect, useState } from "react";
import { DollarSign, ArrowUpRight, ArrowDownRight, Download, Plus, Filter, Wallet, Lock, Unlock } from "lucide-react";
import { NovaMovimentacaoModal } from "@/components/financeiro/NovaMovimentacaoModal";

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
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Financeiro
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Controle de caixa e faturamento empresarial.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {register ? (
            <button onClick={() => handleRegisterAction("CLOSE")} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-xl text-sm font-medium hover:bg-danger/20 transition-colors">
              <Lock className="w-4 h-4" /> Fechar Caixa
            </button>
          ) : (
            <button onClick={() => handleRegisterAction("OPEN")} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-success/10 text-success border border-success/20 rounded-xl text-sm font-medium hover:bg-success/20 transition-colors">
              <Unlock className="w-4 h-4" /> Abrir Caixa
            </button>
          )}
          <button onClick={() => setIsModalOpen(true)} className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover shadow-glow transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Nova Movimentação
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-success rounded-l-2xl"></div>
          <div className="flex items-center gap-4 pl-2">
            <div className="w-12 h-12 rounded-xl bg-success/20 text-success flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entradas (Mês)</p>
              <h3 className="text-2xl font-bold text-success mt-0.5">{formatMoney(dashboard?.totalIncome)}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-danger rounded-l-2xl"></div>
          <div className="flex items-center gap-4 pl-2">
            <div className="w-12 h-12 rounded-xl bg-danger/20 text-danger flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saídas (Mês)</p>
              <h3 className="text-2xl font-bold text-danger mt-0.5">{formatMoney(dashboard?.totalExpense)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-2xl"></div>
          <div className="flex items-center gap-4 pl-2">
            <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saldo do Mês</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{formatMoney(dashboard?.balance)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Histórico Recente</h2>
          <button className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-muted-foreground animate-pulse">Carregando dados financeiros...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Nenhuma movimentação registrada.</div>
        ) : (
          <>
            {/* Mobile View (Cards) */}
            <div className="md:hidden flex flex-col gap-3">
              {transactions.map((t) => (
                <div key={t.id} className="bg-background border border-border rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${t.type === 'INCOME' ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>
                      {t.type === 'INCOME' ? 'Entrada' : 'Saída'}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">{formatDate(t.date)}</span>
                  </div>
                  <div className="font-bold text-foreground mt-1">{t.description}</div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground font-medium uppercase">{t.paymentMethod}</span>
                    <span className={`font-bold ${t.type === 'INCOME' ? 'text-success' : 'text-danger'}`}>
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
                  <tr className="border-b border-border text-muted-foreground text-sm">
                    <th className="py-3 px-4 font-medium">Data</th>
                    <th className="py-3 px-4 font-medium">Descrição</th>
                    <th className="py-3 px-4 font-medium">Tipo</th>
                    <th className="py-3 px-4 font-medium">Pagamento</th>
                    <th className="py-3 px-4 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-border hover:bg-background/50 transition-colors">
                      <td className="py-4 px-4 text-sm text-muted-foreground">{formatDate(t.date)}</td>
                      <td className="py-4 px-4 font-medium">{t.description}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${t.type === 'INCOME' ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>
                          {t.type === 'INCOME' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">{t.paymentMethod}</td>
                      <td className={`py-4 px-4 text-right font-bold ${t.type === 'INCOME' ? 'text-success' : 'text-danger'}`}>
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
