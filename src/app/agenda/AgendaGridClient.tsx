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
      <div key={barber.id} className="flex-1 border-r border-border min-w-[250px] bg-background">
        <div className="h-16 border-b border-border bg-card sticky top-0 z-20 flex flex-col items-center justify-center gap-1 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {barber.name.charAt(0)}
            </div>
            <span className="font-bold text-sm truncate max-w-[150px]">{barber.name}</span>
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
                  
                  let bgClass = "bg-primary/10 border-primary text-primary";
                  if (apt.status === "COMPLETED") bgClass = "bg-green-500/10 border-green-500 text-green-500";
                  if (apt.status === "CANCELLED") bgClass = "bg-red-500/10 border-red-500 text-red-500";

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      key={apt.id} 
                      className={`absolute top-0 left-1 right-1 z-10 rounded-lg border-l-4 p-2 overflow-hidden shadow-sm backdrop-blur-md ${bgClass} flex flex-col justify-between`}
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
    <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border bg-bg-tertiary flex flex-col md:flex-row md:items-center justify-between gap-4">
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

        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 bg-background p-1.5 rounded-xl border border-border">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <div className="font-bold min-w-[140px] text-center text-sm md:text-base">{formattedDate}</div>
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
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
    </div>
  );
}
