"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, CheckCircle2, DollarSign, AlertCircle, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/axios";

interface PixCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  queueItemId?: string;
  onSuccess: () => void;
}

export default function PixCheckoutModal({ isOpen, onClose, customerId, customerName, queueItemId, onSuccess }: PixCheckoutModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("Corte de Cabelo");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"input" | "qrcode" | "success">("input");
  const [pixPayload, setPixPayload] = useState<string>("");
  
  // Informações da Barbearia para o PIX (Mock/Fixo para demonstração)
  const PIX_KEY = "12345678900"; // Substituir pela chave real nas config
  const MERCHANT_NAME = "BarberPro Premium";
  const MERCHANT_CITY = "Sao Paulo";

  // Função super simples para montar um Payload PIX BR Code (Sem CRC para simplificar, a maioria dos apps aceita a leitura básica, mas idealmente usa-se uma lib de payload completo)
  // Como alternativa, podemos apenas exibir o QRCode com um formato básico ou usar uma API para gerar o payload válido.
  // Para fins visuais do MVP:
  const generateMockPixPayload = (val: number) => {
    // Esse é um PIX válido de teste (apenas estrutura visual, sem CRC correto real)
    const formattedAmount = val.toFixed(2).replace('.', '');
    return `00020126330014br.gov.bcb.pix0111${PIX_KEY}520400005303986540${formattedAmount.length}${formattedAmount}5802BR5917${MERCHANT_NAME.substring(0, 17)}6009${MERCHANT_CITY.substring(0, 9)}62070503***6304`;
  };

  const handleGeneratePix = () => {
    const val = parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || val <= 0) return;
    
    setPixPayload(generateMockPixPayload(val));
    setStep("qrcode");
  };

  const handleConfirmPayment = async (isFiado = false) => {
    setIsProcessing(true);
    try {
      const val = parseFloat(amount.replace(',', '.'));
      
      // 1. Registra a Venda no Financeiro
      await api.post('/financeiro', {
        type: "INCOME",
        amount: val,
        description: description,
        paymentMethod: isFiado ? "FIADO" : "PIX",
        status: isFiado ? "PENDING" : "PAID",
        customerId
      });

      // 2. Se for fiado, atualiza o saldo devedor
      if (isFiado) {
        await api.post(`/clientes/${customerId}/pay-debt`, {
          amount: val,
          isAddingDebt: true // Precisamos garantir que a API suporte adicionar dívida
        });
      }

      // 3. Finaliza na fila (se veio de lá)
      if (queueItemId) {
        await api.patch(`/fila/${queueItemId}`, { status: "COMPLETED" });
      }

      setStep("success");
      setTimeout(() => {
        onSuccess();
        onClose();
        // Reset state
        setTimeout(() => { setStep("input"); setAmount(""); }, 500);
      }, 2000);
      
    } catch (e) {
      alert("Erro ao confirmar pagamento.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#111111] border border-primary/30 rounded-3xl w-full max-w-md shadow-[0_0_40px_rgba(212,175,55,0.15)] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1a1a1a] to-[#111111] p-5 border-b border-primary/20 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" /> 
                  Checkout
                </h3>
                <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1 bg-black/20 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {step === "input" && (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 p-3 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs text-primary font-medium uppercase tracking-wider">Cliente</p>
                        <p className="text-white font-bold">{customerName}</p>
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Serviço / Descrição</label>
                      <input 
                        type="text" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input"
                        placeholder="Ex: Corte Degrade + Barba"
                      />
                    </div>

                    <div className="input-group">
                      <label>Valor Total (R$)</label>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input text-2xl font-bold text-primary placeholder:text-primary/30"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                      <button 
                        onClick={handleGeneratePix}
                        disabled={!amount || isNaN(parseFloat(amount))}
                        className="btn-primary w-full py-4 text-base shadow-glow flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-5 h-5" /> Gerar PIX
                      </button>
                      
                      <button 
                        onClick={() => handleConfirmPayment(true)}
                        disabled={!amount || isNaN(parseFloat(amount)) || isProcessing}
                        className="btn-secondary w-full py-3 text-sm text-rose-400 border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/40"
                      >
                        Marcar como Fiado (Pendente)
                      </button>
                    </div>
                  </div>
                )}

                {step === "qrcode" && (
                  <div className="flex flex-col items-center gap-6">
                    <div className="text-center">
                      <p className="text-zinc-400 text-sm mb-1">Valor a receber via PIX</p>
                      <p className="text-4xl font-bold text-primary glow-text">R$ {parseFloat(amount).toFixed(2)}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-xl">
                      <QRCodeSVG value={pixPayload} size={220} level="M" />
                    </div>

                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(pixPayload);
                        alert("Código PIX Copiado!");
                      }}
                      className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" /> Copiar Código PIX
                    </button>

                    <button 
                      onClick={() => handleConfirmPayment(false)}
                      disabled={isProcessing}
                      className="btn-primary w-full py-4 mt-2 shadow-glow text-base flex items-center justify-center gap-2"
                    >
                      {isProcessing ? "Confirmando..." : <><CheckCircle2 className="w-5 h-5" /> Confirmar Pagamento</>}
                    </button>
                  </div>
                )}

                {step === "success" && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-10 gap-4 text-center"
                  >
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-2">Sucesso!</h4>
                      <p className="text-zinc-400">O pagamento foi registrado e o cliente finalizado.</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
