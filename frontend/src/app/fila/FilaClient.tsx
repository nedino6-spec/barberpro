"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Clock, CheckCircle2, Wifi, WifiOff, Settings, ArrowUp, ArrowDown, User as UserIcon } from "lucide-react";

let socket: Socket;

export default function FilaVirtualPage({ 
  initialQueue, 
  barbers,
  queueConfig 
}: { 
  initialQueue: any[],
  barbers: any[],
  queueConfig: any
}) {
  const [queue, setQueue] = useState(initialQueue || []);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [selectedBarber, setSelectedBarber] = useState("");
  const [isPaused, setIsPaused] = useState(queueConfig.isQueuePaused);

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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!customerIdInput) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/fila', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerId: customerIdInput,
          barberId: selectedBarber || undefined
        })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erro ao adicionar");
      } else {
        setCustomerIdInput("");
        const newQ = await fetch('/api/fila').then(r => r.json());
        if(newQ.queue) setQueue(newQ.queue);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    if(newStatus === "COMPLETED" || newStatus === "CANCELLED" || newStatus === "ABSENT") {
      setQueue(prev => prev.filter(item => item.id !== id));
    } else {
      setQueue(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    }
    
    await fetch(`/api/fila/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  }

  async function handleReorder(id: string, direction: 'UP' | 'DOWN') {
    const res = await fetch('/api/fila/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, direction })
    });
    if(res.ok) {
      const updated = await res.json();
      setQueue(updated.queue);
    }
  }

  async function togglePause() {
    const newState = !isPaused;
    setIsPaused(newState);
    await fetch('/api/config/queue', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isQueuePaused: newState })
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
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
              
              <span className="mx-2 text-border">|</span>
              <button onClick={togglePause} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isPaused ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                {isPaused ? 'Fila Pausada' : 'Fila Aberta'}
              </button>
            </div>
          </div>
          
          <form className="flex gap-2 w-full md:w-auto flex-wrap" onSubmit={handleAdd}>
             <input 
               type="text" 
               placeholder="ID do Cliente" 
               className="flex-1 bg-background border border-border text-foreground rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-colors min-w-[120px]" 
               required 
               value={customerIdInput}
               onChange={(e) => setCustomerIdInput(e.target.value)}
             />
             <select 
               className="bg-background border border-border text-foreground rounded-xl px-4 py-2 text-sm outline-none focus:border-primary"
               value={selectedBarber}
               onChange={(e) => setSelectedBarber(e.target.value)}
             >
               <option value="">Qualquer Barbeiro</option>
               {barbers.map(b => (
                 <option key={b.id} value={b.id}>{b.name}</option>
               ))}
             </select>
             <button type="submit" disabled={isSubmitting || isPaused} className="btn-primary px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium shadow-glow transition-all active:scale-95 disabled:opacity-50">
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
                className="flex flex-col md:flex-row md:items-center bg-background border border-border rounded-xl p-4 md:p-5 relative overflow-hidden gap-4"
              >
                {/* Linha indicadora lateral */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl"></div>
                
                <div className="flex-1 flex items-center gap-4 pl-2">
                  <div className="flex flex-col items-center gap-1">
                    <button onClick={() => handleReorder(item.id, 'UP')} className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-30" disabled={index === 0}>
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <div className="text-2xl font-black text-primary/40 w-8 text-center leading-none">
                      {index + 1}
                    </div>
                    <button onClick={() => handleReorder(item.id, 'DOWN')} className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-30" disabled={index === queue.length - 1}>
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <strong className="text-lg font-bold block text-foreground">
                      {item.customer?.name || "Cliente " + item.customerId}
                    </strong>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Clock className="w-3.5 h-3.5" /> 
                        Espera est.: {item.estimatedWaitMins} min
                      </div>
                      {item.barber && (
                        <div className="flex items-center gap-1.5 text-xs text-primary/80 font-medium bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          <UserIcon className="w-3 h-3" />
                          {item.barber.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <select 
                    className="bg-card border border-border text-foreground text-xs font-semibold uppercase tracking-wider rounded-lg px-3 py-2 outline-none focus:border-primary"
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  >
                    <option value="WAITING">Aguardando</option>
                    <option value="CONFIRMED">Confirmado</option>
                    <option value="COMMUTING">A Caminho</option>
                    <option value="NEXT">Próximo</option>
                    <option value="IN_PROGRESS">Em Atendimento</option>
                    <option value="COMPLETED">Finalizado</option>
                    <option value="ABSENT">Ausente</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                  
                  <button 
                    onClick={() => handleStatusChange(item.id, "COMPLETED")} 
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover p-2 rounded-lg active:scale-95 transition-transform"
                  >
                    <CheckCircle2 className="w-4 h-4" /> 
                    <span>Finalizar</span>
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
