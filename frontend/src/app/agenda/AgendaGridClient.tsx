"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarIcon, Plus, Sparkles, Clock } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { initSocketClient } from "@/lib/socket";
import AppointmentModal from "@/components/AppointmentModal";
import { motion } from "framer-motion";

// Gera os blocos de horário uma única vez para performance
const TIME_SLOTS = (() => {
  const slots = [];
  let [h, m] = [8, 0];
  while (h < 21 || (h === 21 && m === 0)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += 30;
    if (m >= 60) { h += 1; m -= 60; }
  }
  return slots;
})();

export default function AgendaGridClient({ barbers, customers, services }: any) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ time: string, barberId: string } | null>(null);
  const [viewApt, setViewApt] = useState<any>(null); // For viewing an existing appointment

  const dateStr = currentDate.toISOString().split('T')[0];
  
  // Cache de Agendamentos (React Query) com Fallback Rápido
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', dateStr],
    queryFn: async () => {
      const { data } = await api.get(`/appointments?date=${dateStr}`);
      return data;
    },
    refetchInterval: 5000, // Atualiza a cada 5s caso o WebSocket falhe
  });

  // Busca Inteligência Artificial para Sugestão de Horários (1º Barbeiro como padrão)
  const defaultBarberId = barbers[0]?.id;
  const { data: aiData } = useQuery({
    queryKey: ['ai-suggestion', dateStr, defaultBarberId],
    queryFn: async () => {
      if (!defaultBarberId) return null;
      const { data } = await api.get(`/ai/suggest-time?date=${dateStr}&barberId=${defaultBarberId}`);
      return data;
    },
    enabled: !!defaultBarberId && !isLoading && appointments.length > 0,
  });

  // WebSockets para sincronização Instantânea
  useEffect(() => {
    const socket = initSocketClient("default_tenant");
    const onNewAppointment = (payload: any) => {
      // Injeta no cache nativamente (Atualização Instantânea = 0ms)
      if (payload?.appointment) {
        const aptDate = new Date(payload.appointment.date).toISOString().split('T')[0];
        queryClient.setQueryData(['appointments', aptDate], (old: any) => {
          if (!old) return [payload.appointment];
          // Evita duplicidade se já existir
          if (old.some((apt: any) => apt.id === payload.appointment.id)) return old;
          return [...old, payload.appointment];
        });
      }
      // Invalida em background por segurança
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    };
    socket.on("NOVO_AGENDAMENTO", onNewAppointment);
    return () => { socket.off("NOVO_AGENDAMENTO", onNewAppointment); };
  }, [queryClient]);

  // Memoização para evitar re-render pesado da Grid
  const gridContent = useMemo(() => {
    return barbers.map((barber: any) => (
      <div key={barber.id} className="flex-1 border-r border-white/10 min-w-[250px] bg-slate-900/20 backdrop-blur-md">
        <div className="h-16 border-b border-white/10 bg-slate-900/60 sticky top-0 z-20 flex flex-col items-center justify-center gap-1 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-sm font-bold shadow-[0_0_10px_rgba(37,99,235,0.3)]">
              {barber.name.charAt(0)}
            </div>
            <span className="font-bold text-sm truncate max-w-[150px] text-white">{barber.name}</span>
          </div>
        </div>

        <div className="relative">
          {TIME_SLOTS.map((time) => {
            const apts = appointments.filter((a: any) => a.barberId === barber.id && a.startTime === time);

            return (
              <div key={`${barber.id}-${time}`} className="h-20 border-b border-border/30 relative group transition-colors hover:bg-bg-tertiary">
                <button 
                  onClick={() => { setSelectedSlot({ time, barberId: barber.id }); setIsModalOpen(true); }}
                  className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <div className="bg-primary text-white rounded-full p-2 shadow-glow scale-75 group-hover:scale-100 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                </button>

                {apts.map((apt: any) => {
                  const startMins = parseInt(apt.startTime.split(':')[0]) * 60 + parseInt(apt.startTime.split(':')[1]);
                  const endMins = parseInt(apt.endTime.split(':')[0]) * 60 + parseInt(apt.endTime.split(':')[1]);
                  const height = ((endMins - startMins) / 30) * 80;
                  
                  let bgClass = "bg-blue-500/20 border-blue-500/50 text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:bg-blue-500/30";
                  if (apt.status === "COMPLETED") bgClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:bg-emerald-500/30";
                  if (apt.status === "CANCELLED") bgClass = "bg-rose-500/20 border-rose-500/50 text-rose-100 shadow-[0_0_10px_rgba(244,63,94,0.3)] hover:bg-rose-500/30";

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      key={apt.id} 
                      onClick={() => setViewApt(apt)}
                      className={`absolute top-0 left-1 right-1 z-10 rounded-lg border-l-4 p-2 overflow-hidden shadow-sm backdrop-blur-md ${bgClass} flex flex-col justify-between cursor-pointer transition-colors`}
                      style={{ height: `${height - 4}px` }}
                    >
                      <div>
                        <div className="text-xs font-bold truncate leading-tight">{apt.customer.name}</div>
                        <div className="text-[10px] opacity-80 truncate leading-tight">{apt.service.name}</div>
                      </div>
                      <div className="text-[10px] flex items-center gap-1 opacity-70">
                        <Clock className="w-3 h-3" /> {apt.startTime} - {apt.endTime}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    ));
  }, [appointments, barbers]);

  const changeDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d);
  };

  const formattedDate = currentDate.toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase();

  return (
    <div className="glass-panel border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-white/10 bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 text-primary rounded-xl">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Agenda Inteligente</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Sincronizado ao Vivo
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 glass-panel p-1.5 rounded-xl border border-white/10">
          <button onClick={() => changeDate(-1)} className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <div className="relative flex items-center justify-center min-w-[150px]">
            <input 
              type="date" 
              value={dateStr}
              onChange={(e) => setCurrentDate(new Date(e.target.value + "T12:00:00"))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="font-bold text-center text-sm md:text-base text-white">{formattedDate}</div>
          </div>
          <button onClick={() => changeDate(1)} className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {aiData?.suggestion && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between text-sm text-primary font-medium">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Sugestão da IA para {barbers[0]?.name}: {aiData.suggestion} é o horário com maior probabilidade de ser preenchido.
          </div>
          <button 
            onClick={() => { setSelectedSlot({ time: aiData.suggestion, barberId: defaultBarberId }); setIsModalOpen(true); }}
            className="px-3 py-1 bg-primary text-white rounded shadow-glow text-xs"
          >
            Auto Encaixe
          </button>
        </motion.div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto relative custom-scrollbar">
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="min-w-[800px] flex">
          <div className="w-24 flex-shrink-0 border-r border-border bg-bg-tertiary sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
            <div className="h-16 border-b border-border"></div>
            {TIME_SLOTS.map((time) => (
              <div key={time} className="h-20 border-b border-border/50 flex flex-col items-center justify-start py-2 text-xs font-medium text-muted-foreground">
                {time}
              </div>
            ))}
          </div>
          {gridContent}
        </div>
      </div>

      <AppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customers={customers}
        barbers={barbers}
        services={services}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['appointments', dateStr] });
          setIsModalOpen(false);
        }}
        initialSlot={selectedSlot ? { date: dateStr, time: selectedSlot.time, barberId: selectedSlot.barberId } : undefined}
      />

      {viewApt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Gerenciar Agendamento</h2>
            <div className="space-y-2 mb-6">
              <p className="text-sm text-slate-300"><strong>Cliente:</strong> {viewApt.customer?.name}</p>
              <p className="text-sm text-slate-300"><strong>Serviço:</strong> {viewApt.service?.name}</p>
              <p className="text-sm text-slate-300"><strong>Horário:</strong> {viewApt.startTime} às {viewApt.endTime}</p>
              <p className="text-sm text-slate-300"><strong>Status Atual:</strong> {viewApt.status}</p>
            </div>
            
            <div className="flex flex-col gap-3">
              {viewApt.status === "PENDING" && (
                <>
                  <button 
                    onClick={async () => {
                      await api.patch(`/appointments/${viewApt.id}`, { status: "COMPLETED" });
                      queryClient.invalidateQueries({ queryKey: ['appointments', dateStr] });
                      setViewApt(null);
                    }}
                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-500 transition-all border-t border-emerald-400/30"
                  >
                    Marcar como Concluído
                  </button>
                  <button 
                    onClick={async () => {
                      await api.patch(`/appointments/${viewApt.id}`, { status: "CANCELLED" });
                      queryClient.invalidateQueries({ queryKey: ['appointments', dateStr] });
                      setViewApt(null);
                    }}
                    className="w-full py-2.5 bg-rose-600 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:bg-rose-500 transition-all border-t border-rose-400/30"
                  >
                    Cancelar Agendamento
                  </button>
                </>
              )}
              <button 
                onClick={() => setViewApt(null)}
                className="w-full py-2.5 bg-slate-800 border border-white/10 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors mt-2"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
