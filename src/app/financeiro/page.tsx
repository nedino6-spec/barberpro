import { DollarSign, ArrowUpRight, ArrowDownRight, Download, Plus, Filter, Wallet } from "lucide-react";

export default function FinanceiroPage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Financeiro
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Controle de caixa e faturamento.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-medium hover:bg-bg-tertiary transition-colors active:scale-95">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Exportar</span>
          </button>
          <button className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover shadow-glow transition-all active:scale-95">
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
              <h3 className="text-2xl font-bold text-success mt-0.5">R$ 15.450,00</h3>
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
              <h3 className="text-2xl font-bold text-danger mt-0.5">R$ 4.200,00</h3>
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
              <p className="text-sm font-medium text-muted-foreground">Saldo Atual</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">R$ 11.250,00</h3>
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
        
        {/* Mobile View (Cards) */}
        <div className="md:hidden flex flex-col gap-3">
          {[
            { data: "19/05 - 15:30", desc: "Corte Degradê (Marcos)", tipo: "Entrada", barb: "Pedro", valor: "+ R$ 45,00", color: "text-success bg-success/10", valColor: "text-success" },
            { data: "19/05 - 14:00", desc: "Pagamento Fornecedor", tipo: "Saída", barb: "-", valor: "- R$ 150,00", color: "text-danger bg-danger/10", valColor: "text-danger" },
          ].map((item, i) => (
            <div key={i} className="bg-background border border-border rounded-xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${item.color}`}>
                  {item.tipo}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{item.data}</span>
              </div>
              <div className="font-bold text-foreground mt-1">{item.desc}</div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Barbeiro: {item.barb}</span>
                <span className={`font-bold ${item.valColor}`}>{item.valor}</span>
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
                <th className="py-3 px-4 font-medium">Barbeiro</th>
                <th className="py-3 px-4 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="py-4 px-4 text-sm text-muted-foreground">19/05 - 15:30</td>
                <td className="py-4 px-4 font-medium">Corte Degradê (Marcos)</td>
                <td className="py-4 px-4"><span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-success bg-success/10">Entrada</span></td>
                <td className="py-4 px-4 text-sm text-muted-foreground">Pedro</td>
                <td className="py-4 px-4 text-right font-bold text-success">+ R$ 45,00</td>
              </tr>
              <tr className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="py-4 px-4 text-sm text-muted-foreground">19/05 - 14:00</td>
                <td className="py-4 px-4 font-medium">Pagamento Fornecedor (Toalhas)</td>
                <td className="py-4 px-4"><span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-danger bg-danger/10">Saída</span></td>
                <td className="py-4 px-4 text-sm text-muted-foreground">-</td>
                <td className="py-4 px-4 text-right font-bold text-danger">- R$ 150,00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
