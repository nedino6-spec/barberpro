"use client";

import { useState } from "react";
import { X, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().min(3, "A descrição deve ter no mínimo 3 caracteres"),
  amount: z.number().min(0.01, "O valor deve ser maior que zero"),
  paymentMethod: z.string().min(1, "O método de pagamento é obrigatório"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export function NovaMovimentacaoModal({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: () => void }) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "INCOME",
      description: "",
      amount: 0,
      paymentMethod: "PIX",
    }
  });

  const transactionType = watch("type");

  if (!isOpen) return null;

  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    
    try {
      const response = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        toast.success("Movimentação salva com sucesso!");
        onSave();
        reset();
        onClose();
      } else {
        toast.error("Erro ao salvar movimentação.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Nova Movimentação</h2>
          <button type="button" onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue("type", "INCOME")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${transactionType === 'INCOME' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold' : 'border-white/10 text-slate-400 hover:bg-white/5 font-medium'}`}
            >
              <ArrowUpRight className="w-4 h-4" /> Entrada
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "EXPENSE")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${transactionType === 'EXPENSE' ? 'border-rose-500 bg-rose-500/10 text-rose-400 font-bold' : 'border-white/10 text-slate-400 hover:bg-white/5 font-medium'}`}
            >
              <ArrowDownRight className="w-4 h-4" /> Saída
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição</label>
            <input 
              type="text" 
              {...register("description")}
              placeholder="Ex: Corte Degradê, Pagamento de Luz"
              className={`input ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <span className="text-red-500 text-xs font-medium">{errors.description.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor (R$)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <DollarSign className="w-4 h-4" />
              </div>
              <input 
                type="number" 
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                placeholder="0.00"
                className={`input pl-10 ${errors.amount ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.amount && <span className="text-red-500 text-xs font-medium">{errors.amount.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Forma de Pagamento</label>
            <select 
              {...register("paymentMethod")}
              className={`input ${errors.paymentMethod ? 'border-red-500' : ''}`}
            >
              <option value="PIX">Pix</option>
              <option value="CREDIT_CARD">Cartão de Crédito</option>
              <option value="DEBIT_CARD">Cartão de Débito</option>
              <option value="MONEY">Dinheiro</option>
            </select>
            {errors.paymentMethod && <span className="text-red-500 text-xs font-medium">{errors.paymentMethod.message}</span>}
          </div>

          <div className="pt-4 mt-4 border-t border-white/10">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] border-t border-blue-400/30 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar Movimentação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
