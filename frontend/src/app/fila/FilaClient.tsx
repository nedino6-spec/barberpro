"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { addToQueue, completeQueueItem } from "./actions";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Clock, CheckCircle2, Wifi, WifiOff } from "lucide-react";

let socket: Socket;

export default function FilaVirtualPage({ initialQueue }: { initialQueue: any[] }) {
  const [queue, setQueue] = useState(initialQueue || []);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || "http://localhost:3001";
    socket = io(wsUrl);

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    
    socket.on("queue_updated", () => {
      window.location.reload();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  async function handleComplete(id: string) {
    await completeQueueItem(id);
    setQueue(prev => prev.filter(item => item.id !== id));
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header Fila */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Fila Virtual
            </h2>
            <div className={`mt-1 flex items-center gap-1.5 text-xs font-medium ${socketConnected ? 'text-success' : 'text-danger'}`}>
              {socketConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {socketConnected ? 'Conectado em tempo real' : 'Reconectando...'}
            </div>
          </div>
          
          <form action={addToQueue} className="flex gap-2 w-full md:w-auto" onSubmit={() => setIsSubmitting(true)}>
             <input 
               type="text" 
               name="customerId" 
               placeholder="ID ou Nome do Cliente" 
               className="flex-1 bg-background border border-border text-foreground rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-colors" 
               required 
             />
             <button type="submit" disabled={isSubmitting} className="btn-primary px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium shadow-glow transition-all active:scale-95 disabled:opacity-50">
               Adicionar
             </button>
          </form>
        </div>

        {/* Fila Items */}
        <div className="flex flex-col gap-3">
          {queue.length === 0 && (
            <div className="text-center py-10 text-muted-foreground bg-background rounded-xl border border-dashed border-border">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>A fila está vazia no momento.</p>
            </div>
          )}
          
          <AnimatePresence>
            {queue.map((item, index) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center bg-background border border-border rounded-xl p-4 md:p-5 relative overflow-hidden"
              >
                {/* Linha indicadora lateral */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl"></div>
                
                <div className="flex-1 flex items-center gap-4 pl-2">
                  <div className="text-3xl font-black text-primary/30 w-10 text-center">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <strong className="text-lg font-bold block text-foreground">
                      {item.customer?.name || "Cliente " + item.customerId}
                    </strong>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 font-medium">
                      <Clock className="w-3.5 h-3.5" /> 
                      Espera est.: {item.estimatedWaitMins} min
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-warning bg-warning/10">
                    {item.status}
                  </span>
                  <button 
                    onClick={() => handleComplete(item.id)} 
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover p-1.5 active:scale-95 transition-transform"
                  >
                    <CheckCircle2 className="w-4 h-4" /> 
                    <span className="hidden sm:inline">Finalizar</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
