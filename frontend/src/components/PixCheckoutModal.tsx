"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { X, CheckCircle2, Wallet, Banknote, QrCode } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  queueItemId: string;
  onSuccess: () => void;
}

export default function PixCheckoutModal({ isOpen, onClose, customerId, customerName, queueItemId, onSuccess }: Props) {
  const [amount, setAmount] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pixPayload, setPixPayload] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const handleGeneratePix = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast.error("Insira um valor válido");
      return;
    }
    setIsGenerating(true);
    // Simular chamada real
    setTimeout(() => {
      // Mock do payload BR Code
      setPixPayload(`00020126580014br.gov.bcb.pix0136suachave@pix.com.br5204000053039865404${amount}5802BR5913Sua Barbearia6009SAO PAULO62070503***6304`);
      setIsGenerating(false);
    }, 1000);
  };

  const handleFinish = async (isDebt: boolean = false) => {
    setIsFinishing(true);
    try {
      const numericAmount = Number(amount) || 0;
      
      // Chamar backend para registrar financeiro e atualizar queue status para COMPLETED
      await api.post(`/clientes/${customerId}/pay-debt`, {
        amount: numericAmount,
        isAddingDebt: isDebt,
        queueItemId: queueItemId
      });

      toast.success(isDebt ? "Registrado como Fiado!" : "Pagamento Confirmado!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Erro ao finalizar atendimento");
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-slate-900 border border-primary/30 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" /> Checkout - {customerName}
              </h2>
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {!pixPayload ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Valor Total do Atendimento (R$)</label>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-2xl text-center font-bold text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button 
                      onClick={() => handleFinish(false)}
                      disabled={isFinishing || !amount}
                      className="flex flex-col items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 p-4 rounded-xl transition-colors font-bold disabled:opacity-50"
                    >
                      <Banknote className="w-6 h-6" />
                      Dinheiro
                    </button>
                    <button 
                      onClick={handleGeneratePix}
                      disabled={isGenerating || !amount}
                      className="flex flex-col items-center justify-center gap-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 p-4 rounded-xl transition-colors font-bold disabled:opacity-50"
                    >
                      {isGenerating ? (
                         <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                         <QrCode className="w-6 h-6" />
                      )}
                      Gerar PIX
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleFinish(true)}
                    disabled={isFinishing || !amount}
                    className="w-full mt-2 text-rose-400 text-sm font-medium hover:text-rose-300 py-2 transition-colors disabled:opacity-50"
                  >
                    Marcar como Fiado (Pendência)
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-5">
                  <div className="bg-white p-4 rounded-2xl shadow-xl">
                    <QRCodeSVG value={pixPayload} size={200} />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Mostre ao cliente para escanear</p>
                    <p className="text-2xl font-black text-primary mt-1">R$ {Number(amount).toFixed(2)}</p>
                  </div>

                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => setPixPayload(null)}
                      className="flex-1 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={() => handleFinish(false)}
                      disabled={isFinishing}
                      className="flex-[2] bg-primary text-black font-black py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Pagamento Recebido
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
