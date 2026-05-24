"use client";

import { useState } from "react";
import { X, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function NovaMovimentacaoModal({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: () => void }) {
  const [type, setType] = useState("INCOME");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          description,
          amount: parseFloat(amount),
          paymentMethod,
        }),
      });
      
      if (response.ok) {
        onSave();
        onClose();
        setDescription("");
        setAmount("");
      } else {
        alert("Erro ao salvar movimentação.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-bold">Nova Movimentação</h2>
          <button onClick={onClose} className="p-1 hover:bg-bg-tertiary rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("INCOME")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border ${type === 'INCOME' ? 'border-success bg-success/10 text-success font-bold' : 'border-border text-muted-foreground hover:bg-bg-tertiary'}`}
            >
              <ArrowUpRight className="w-4 h-4" /> Entrada
            </button>
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border ${type === 'EXPENSE' ? 'border-danger bg-danger/10 text-danger font-bold' : 'border-border text-muted-foreground hover:bg-bg-tertiary'}`}
            >
              <ArrowDownRight className="w-4 h-4" /> Saída
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Descrição</label>
            <input 
              type="text" 
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Corte Degradê, Pagamento de Luz"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Valor (R$)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
              </div>
              <input 
                type="number" 
                step="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Forma de Pagamento</label>
            <select 
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors"
            >
              <option value="PIX">Pix</option>
              <option value="CREDIT_CARD">Cartão de Crédito</option>
              <option value="DEBIT_CARD">Cartão de Débito</option>
              <option value="MONEY">Dinheiro</option>
            </select>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover active:scale-95 transition-all shadow-glow disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar Movimentação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
