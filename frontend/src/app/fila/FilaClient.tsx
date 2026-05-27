"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Settings, PauseCircle, Activity, Search, BarChart3, Clock, Star } from "lucide-react";
import { api } from "@/lib/axios";
import PixCheckoutModal from "@/components/PixCheckoutModal";

// dnd-kit imports
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableQueueItem } from "./SortableQueueItem";

export default function FilaVirtualPage({ initialQueue }: { initialQueue: any[] }) {
  const queryClient = useQueryClient();
  const [showConfig, setShowConfig] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [checkoutData, setCheckoutData] = useState<{isOpen: boolean, customerId: string, customerName: string, queueItemId: string} | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Filter by Barber
  const [selectedBarberId, setSelectedBarberId] = useState<string>("ALL");

  // Local state for optimistic updates during Drag & Drop
  const [items, setItems] = useState<any[]>(initialQueue);

  const { data: barbers = [] } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const { data } = await api.get('/barbers');
      return data;
    }
  });

  const { data: queue = initialQueue, isLoading } = useQuery({
    queryKey: ['fila'],
    queryFn: async () => {
      const { data } = await api.get('/fila');
      return data;
    },
    refetchInterval: 3000, 
    initialData: initialQueue,
  });

  // Sync local state when external data arrives, but only if not dragging
  useEffect(() => {
    setItems(queue);
  }, [queue]);

  const { data: config } = useQuery({
    queryKey: ['fila-config'],
    queryFn: async () => {
      const { data } = await api.get('/config/queue');
      return data;
    },
    refetchInterval: 10000,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['fila-history', selectedBarberId],
    queryFn: async () => {
      const params = selectedBarberId !== 'ALL' ? `?barberId=${selectedBarberId}` : '';
      const { data } = await api.get(`/fila/historico${params}`);
      return data;
    },
    enabled: showHistory,
    refetchInterval: 30000,
  });

  const addMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post('/fila', { customerId: id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fila'] });
      setCustomerId("");
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Erro ao adicionar à fila.");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { data } = await api.patch(`/fila/${id}`, { status, barberId: selectedBarberId !== "ALL" ? selectedBarberId : undefined });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fila'] })
  });

  const reorderMutation = useMutation({
    mutationFn: async (newOrder: { id: string, orderIndex: number }[]) => {
      const { data } = await api.patch('/fila/reorder', { items: newOrder });
      return data;
    },
    // We don't invalidate immediately to avoid jitter, let the next 3s poll do it
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: any) => {
      const { data } = await api.patch('/config/queue', newConfig);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fila-config'] })
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId.trim()) return;
    addMutation.mutate(customerId);
  };

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Recalculate orderIndexes
        const reorderedPayload = newArray.map((item, idx) => ({
          id: item.id,
          orderIndex: idx + 1
        }));
        
        // Fire mutation
        reorderMutation.mutate(reorderedPayload);

        return newArray;
      });
    }
  };

  // Filtragem
  const filteredItems = items.filter(i => {
    if (selectedBarberId === "ALL") return true;
    return i.barberId === selectedBarberId || !i.barberId; 
    // Mostrar clientes sem barbeiro definido ou do barbeiro
  });

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Alerta de Fila Pausada ou Fechada */}
      {config?.isQueuePaused && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-warning/20 border border-warning/50 text-warning px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <PauseCircle className="w-5 h-5" /> A Fila Virtual está pausada no momento.
          </div>
          <button onClick={() => updateConfigMutation.mutate({ isQueuePaused: false })} className="text-xs px-3 py-1.5 bg-warning text-warning-foreground rounded-lg font-bold">Retomar</button>
        </motion.div>
      )}

      {/* Header Fila */}
      <div className="glass-panel border border-white/10 rounded-2xl p-4 md:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <Users className="w-6 h-6 text-primary" /> Fila Inteligente
            </h2>
            <div className="mt-1 flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1 text-emerald-400">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> Ao Vivo
              </span>
              {config && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                  {config.currentQueueSize || 0}/{config.queueMaxSize || 30} pessoas
                </span>
              )}
              {config && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  {config.queueOpenTime} – {config.queueCloseTime}
                </span>
              )}
            </div>
            {/* Barra de Capacidade */}
            {config && (
              <div className="mt-2 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    (config.currentQueueSize / config.queueMaxSize) > 0.8 ? 'bg-rose-500' :
                    (config.currentQueueSize / config.queueMaxSize) > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, ((config.currentQueueSize || 0) / (config.queueMaxSize || 30)) * 100)}%` }}
                />
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full lg:w-auto">
            {/* Seletor de Barbeiro */}
            <select 
              className="bg-slate-900 border border-white/10 text-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary"
              value={selectedBarberId}
              onChange={(e) => setSelectedBarberId(e.target.value)}
            >
              <option value="ALL">Todos os Barbeiros</option>
              {barbers.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name} {b.specialty ? `(${b.specialty})` : ''}</option>
              ))}
            </select>

            <form onSubmit={handleAdd} className="flex gap-2 flex-1">
               <div className="relative flex-1">
                 <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                 <input 
                   type="text" 
                   value={customerId}
                   onChange={(e) => setCustomerId(e.target.value)}
                   placeholder="ID do Cliente" 
                   className="w-full bg-slate-900 border border-white/10 text-white rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-primary transition-colors" 
                 />
               </div>
               <button type="submit" disabled={addMutation.isPending} className="btn-primary px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium shadow-glow transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap">
                 + Adicionar
               </button>
            </form>

            <button 
              onClick={() => { setShowHistory(!showHistory); setShowConfig(false); }}
              className={`p-2.5 border border-white/10 rounded-xl transition-colors shrink-0 ${showHistory ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'}`}
              title="Histórico do Dia"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { setShowConfig(!showConfig); setShowHistory(false); }}
              className={`p-2.5 border border-white/10 rounded-xl transition-colors shrink-0 ${showConfig ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'}`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configurações */}
        <AnimatePresence>
          {showConfig && config && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-200">
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-400 text-xs">Horário de Abertura</label>
                  <input type="time" value={config.queueOpenTime} onChange={(e) => updateConfigMutation.mutate({ queueOpenTime: e.target.value })} className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-400 text-xs">Horário de Fechamento</label>
                  <input type="time" value={config.queueCloseTime} onChange={(e) => updateConfigMutation.mutate({ queueCloseTime: e.target.value })} className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-400 text-xs">Limite Máximo de Pessoas</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="1" max="100"
                      value={config.queueMaxSize || 30}
                      onChange={(e) => updateConfigMutation.mutate({ queueMaxSize: e.target.value })} 
                      className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 outline-none text-white" 
                    />
                    <span className="text-xs text-slate-500 whitespace-nowrap">({config.currentQueueSize || 0} agora)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-3 md:justify-end">
                  <span className="font-medium">Pausar Fila:</span>
                  <button onClick={() => updateConfigMutation.mutate({ isQueuePaused: !config.isQueuePaused })} className={`w-12 h-6 rounded-full p-1 transition-colors ${config.isQueuePaused ? 'bg-warning' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${config.isQueuePaused ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fila Items com Drag and Drop */}
        <div className="flex flex-col gap-3">
          {filteredItems.length === 0 && (
            <div className="text-center py-10 text-slate-400 bg-slate-900/30 rounded-xl border border-dashed border-white/10">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>A fila está vazia no momento.</p>
            </div>
          )}
          
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence>
                {filteredItems.map((item: any, index: number) => (
                  <SortableQueueItem 
                    key={item.id} 
                    item={item} 
                    index={index} 
                    onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
                    onCheckout={(checkoutItem) => setCheckoutData({
                      isOpen: true,
                      customerId: checkoutItem.customerId,
                      customerName: checkoutItem.customer?.name || "Cliente " + checkoutItem.customerId,
                      queueItemId: checkoutItem.id
                    })}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Painel de Histórico do Dia */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-panel border border-white/10 rounded-2xl p-4 md:p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Histórico de Hoje
              {history.stats && (
                <div className="ml-auto flex items-center gap-4 text-sm font-normal">
                  <span className="text-slate-400"><span className="text-white font-bold">{history.stats?.total}</span> atendimentos</span>
                  <span className="text-slate-400">TMA: <span className="text-amber-400 font-bold">{history.stats?.averageMins}min</span></span>
                  {history.stats?.averageRating && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-bold">{history.stats.averageRating}</span>
                    </span>
                  )}
                </div>
              )}
            </h3>
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {(history.items || []).length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">Nenhum atendimento concluído hoje.</p>
              ) : (
                (history.items || []).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between bg-slate-900/40 rounded-xl p-3 border border-white/5">
                    <div>
                      <strong className="text-white text-sm">{item.customer?.name}</strong>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        {item.barber && <span>✂️ {item.barber.name}</span>}
                        {item.service && <span>• {item.service.name}</span>}
                        {item.durationMins > 0 && <span>• <Clock className="w-3 h-3 inline" /> {item.durationMins}min</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.rating && (
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3 h-3 ${s <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-slate-500">
                        {item.completedAt ? new Date(item.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info: Link Público */}
      <div className="glass-panel border border-white/10 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">📱 Link Público da Fila</p>
          <p className="text-xs text-slate-400 mt-0.5">Clientes podem entrar na fila pelo celular via API</p>
        </div>
        <code className="text-xs bg-slate-900 text-primary border border-white/10 px-3 py-1.5 rounded-lg">
          /api/fila/publica
        </code>
      </div>

      {checkoutData && (
        <PixCheckoutModal 
          isOpen={checkoutData.isOpen}
          onClose={() => setCheckoutData(null)}
          customerId={checkoutData.customerId}
          customerName={checkoutData.customerName}
          queueItemId={checkoutData.queueItemId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['fila'] });
          }}
        />
      )}
    </div>
  );
}
