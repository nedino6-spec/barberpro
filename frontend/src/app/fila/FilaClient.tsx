"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Clock, CheckCircle2, Settings, PauseCircle, Scissors, XCircle, Activity, ArrowUp, ArrowDown, UserX, SkipForward, ArrowRightLeft } from "lucide-react";
import { api } from "@/lib/axios";
import PixCheckoutModal from "@/components/PixCheckoutModal";

export default function FilaVirtualPage({ initialQueue }: { initialQueue: any[] }) {
  const queryClient = useQueryClient();
  const [showConfig, setShowConfig] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [checkoutData, setCheckoutData] = useState<{isOpen: boolean, customerId: string, customerName: string, queueItemId: string} | null>(null);
  
  // Buscar a Fila
  const { data: queue = initialQueue, isLoading } = useQuery({
    queryKey: ['fila'],
    queryFn: async () => {
      const { data } = await api.get('/fila');
      return data;
    },
    refetchInterval: 2000, // Sync rápido
    initialData: initialQueue,
  });

  // Buscar Configurações
  const { data: config } = useQuery({
    queryKey: ['fila-config'],
    queryFn: async () => {
      const { data } = await api.get('/config/queue');
      return data;
    },
    refetchInterval: 10000,
  });

  // Buscar Barbeiros para transferência
  const { data: barbers = [] } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const { data } = await api.get('/barbers'); // Assumindo rota genérica
      return data;
    }
  });

  const addMutation = useMutation({
    mutationFn: async (id: string) => {
      const payload: any = { customerId: id };
      if (selectedBarber) payload.barberId = selectedBarber;
      const { data } = await api.post('/fila', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fila'] });
      setCustomerId("");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, barberId }: { id: string, status?: string, barberId?: string }) => {
      const payload: any = {};
      if (status) payload.status = status;
      if (barberId) payload.barberId = barberId;
      const { data } = await api.patch(`/fila/${id}`, payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fila'] })
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: any[]) => {
      const { data } = await api.post('/fila/reorder', { items });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fila'] })
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: any) => {
      const { data } = await api.patch('/config/queue', newConfig);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fila-config'] });
    }
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId.trim()) return;
    addMutation.mutate(customerId);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newQueue = [...queue];
    const temp = newQueue[index - 1].orderIndex;
    newQueue[index - 1].orderIndex = newQueue[index].orderIndex;
    newQueue[index].orderIndex = temp;
    
    // Call reorder API for both items
    reorderMutation.mutate([
      { id: newQueue[index - 1].id, orderIndex: newQueue[index - 1].orderIndex },
      { id: newQueue[index].id, orderIndex: newQueue[index].orderIndex }
    ]);
  };

  const handleMoveDown = (index: number) => {
    if (index === queue.length - 1) return;
    const newQueue = [...queue];
    const temp = newQueue[index + 1].orderIndex;
    newQueue[index + 1].orderIndex = newQueue[index].orderIndex;
    newQueue[index].orderIndex = temp;
    
    reorderMutation.mutate([
      { id: newQueue[index + 1].id, orderIndex: newQueue[index + 1].orderIndex },
      { id: newQueue[index].id, orderIndex: newQueue[index].orderIndex }
    ]);
  };

  const statusColors: any = {
    WAITING: "text-slate-400",
    CONFIRMED: "text-blue-400",
    COMMUTING: "text-purple-400",
    NEXT: "text-amber-400 font-bold",
    IN_PROGRESS: "text-primary font-bold",
  };

  const statusLabels: any = {
    WAITING: "Aguardando",
    CONFIRMED: "Confirmado",
    COMMUTING: "Em deslocamento",
    NEXT: "Próximo",
    IN_PROGRESS: "Em Atendimento",
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {config?.isQueuePaused && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-warning/20 border border-warning/50 text-warning px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <PauseCircle className="w-5 h-5" /> Fila Pausada.
          </div>
          <button onClick={() => updateConfigMutation.mutate({ isQueuePaused: false })} className="text-xs px-3 py-1.5 bg-warning text-warning-foreground rounded-lg font-bold">Retomar</button>
        </motion.div>
      )}

      <div className="glass-panel border border-primary/20 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
              <Users className="w-5 h-5" /> Fila Virtual Pro
            </h2>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Realtime Sync (Supabase)
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <form onSubmit={handleAdd} className="flex gap-2 flex-1 items-center">
               {config?.isMultiBarber && (
                 <select 
                   value={selectedBarber} 
                   onChange={(e) => setSelectedBarber(e.target.value)}
                   className="bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2 text-sm"
                 >
                   <option value="">Fila Geral</option>
                   {barbers.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                 </select>
               )}
               <input 
                 type="text" 
                 value={customerId}
                 onChange={(e) => setCustomerId(e.target.value)}
                 placeholder="ID Cliente" 
                 className="flex-1 bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-colors" 
               />
               <button type="submit" disabled={addMutation.isPending} className="btn-primary px-4 py-2 bg-gradient-to-r from-primary to-yellow-600 text-black rounded-xl text-sm font-bold shadow-glow transition-all active:scale-95 disabled:opacity-50">
                 + Add
               </button>
            </form>
            <button onClick={() => setShowConfig(!showConfig)} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showConfig && config && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden mb-6">
              <div className="p-4 bg-black/50 border border-primary/20 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-200">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Abertura</label>
                  <input type="time" value={config.queueOpenTime} onChange={(e) => updateConfigMutation.mutate({ queueOpenTime: e.target.value })} className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Fechamento</label>
                  <input type="time" value={config.queueCloseTime} onChange={(e) => updateConfigMutation.mutate({ queueCloseTime: e.target.value })} className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5" />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <span className="font-medium text-xs">Pausar:</span>
                  <button onClick={() => updateConfigMutation.mutate({ isQueuePaused: !config.isQueuePaused })} className={`w-10 h-5 rounded-full p-0.5 ${config.isQueuePaused ? 'bg-warning' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${config.isQueuePaused ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <span className="font-medium text-xs text-primary">Multi-Barbeiro:</span>
                  <button onClick={() => updateConfigMutation.mutate({ isMultiBarber: !config.isMultiBarber })} className={`w-10 h-5 rounded-full p-0.5 ${config.isMultiBarber ? 'bg-primary' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${config.isMultiBarber ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3">
          {queue.length === 0 && (
            <div className="text-center py-10 text-slate-400 bg-black/40 rounded-xl border border-dashed border-white/10">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>Ninguém na fila.</p>
            </div>
          )}
          
          <AnimatePresence>
            {queue.map((item: any, index: number) => {
              const isInProgress = item.status === "IN_PROGRESS";
              
              return (
                <motion.div 
                  key={item.id} 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex flex-col md:flex-row items-center bg-black/60 border border-white/5 rounded-xl p-3 gap-4 relative overflow-hidden group ${isInProgress ? 'ring-1 ring-primary/50 bg-primary/5' : ''}`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isInProgress ? 'bg-primary shadow-glow' : 'bg-slate-700'}`}></div>
                  
                  {/* Reorder Buttons */}
                  <div className="flex flex-col ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleMoveUp(index)} className="text-slate-500 hover:text-white"><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={() => handleMoveDown(index)} className="text-slate-500 hover:text-white"><ArrowDown className="w-4 h-4" /></button>
                  </div>

                  <div className="text-2xl font-black text-slate-700 w-6 text-center">{index + 1}</div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2">
                      <strong className="text-base text-white">{item.customer?.name || "Cliente " + item.customerId}</strong>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 ${statusColors[item.status]}`}>
                        {statusLabels[item.status]}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Espera: ~{item.estimatedWaitMins} min</span>
                      {item.barber && <span className="flex items-center gap-1 text-primary/80"><Scissors className="w-3.5 h-3.5" /> {item.barber.name}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Status Selectors */}
                    <select 
                      value={item.status} 
                      onChange={(e) => updateStatusMutation.mutate({ id: item.id, status: e.target.value })}
                      className="bg-slate-900 border border-white/10 text-xs text-white rounded-lg px-2 py-1.5 max-w-[120px]"
                    >
                      <option value="WAITING">Aguardando</option>
                      <option value="CONFIRMED">Confirmado</option>
                      <option value="COMMUTING">A Caminho</option>
                      <option value="NEXT">Próximo!</option>
                    </select>

                    {item.status !== "IN_PROGRESS" ? (
                      <button onClick={() => updateStatusMutation.mutate({ id: item.id, status: "IN_PROGRESS" })} className="btn-primary text-xs px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary hover:text-black transition-colors flex items-center gap-1">
                        <PlayCircle className="w-4 h-4" /> Atender
                      </button>
                    ) : (
                      <button onClick={() => setCheckoutData({ isOpen: true, customerId: item.customerId, customerName: item.customer?.name || "", queueItemId: item.id })} className="text-xs px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Checkout
                      </button>
                    )}
                    
                    <button onClick={() => updateStatusMutation.mutate({ id: item.id, status: "ABSENT" })} title="Marcar Ausente" className="p-1.5 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors">
                      <UserX className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateStatusMutation.mutate({ id: item.id, status: "CANCELLED" })} title="Cancelar" className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {checkoutData && (
        <PixCheckoutModal 
          isOpen={checkoutData.isOpen}
          onClose={() => setCheckoutData(null)}
          customerId={checkoutData.customerId}
          customerName={checkoutData.customerName}
          queueItemId={checkoutData.queueItemId}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['fila'] })}
        />
      )}
    </div>
  );
}
