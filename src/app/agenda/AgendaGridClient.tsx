"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, User, CalendarIcon, Plus } from "lucide-react";
import AppointmentModal from "@/components/AppointmentModal";

// Helper para gerar horários de meia em meia hora
function generateTimeSlots(openTime = "08:00", closeTime = "20:00") {
  const slots = [];
  let [h, m] = openTime.split(":").map(Number);
  const [endH, endM] = closeTime.split(":").map(Number);

  while (h < endH || (h === endH && m <= endM)) {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
    m += 30;
    if (m >= 60) {
      h += 1;
      m -= 60;
    }
  }
  return slots;
}

export default function AgendaGridClient({ barbers, customers, services }: any) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Para modal pré-preenchido
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ time: string, barberId: string } | null>(null);

  const timeSlots = generateTimeSlots("08:00", "21:00"); // Em breve puxaremos de BusinessHours

  const fetchAppointments = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const res = await fetch(`/api/appointments?date=${dateStr}`);
      const data = await res.json();
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(currentDate);
  }, [currentDate]);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const formattedDate = currentDate.toLocaleDateString("pt-BR", {
    weekday: 'long', day: 'numeric', month: 'short'
  });

  const handleSlotClick = (time: string, barberId: string) => {
    setSelectedSlot({ time, barberId });
    setIsModalOpen(true);
  };

  // Helper para posicionar os blocos
  const getAppointmentStyle = (app: any) => {
    // Calcula o índice de início
    const startIndex = timeSlots.indexOf(app.startTime);
    // Para simplificar, assumimos blocos de 30 mins
    const durationBlocks = Math.ceil(app.service.durationMinutes / 30) || 1;
    
    // Altura base = 60px por slot
    const top = startIndex * 60;
    const height = durationBlocks * 60;

    let bgClass = "bg-warning/20 border-warning text-warning-dark"; // PENDING
    if (app.status === "CONFIRMED") bgClass = "bg-primary/20 border-primary text-primary-dark";
    if (app.status === "COMPLETED") bgClass = "bg-success/20 border-success text-success-dark";

    return {
      top: `${top}px`,
      height: `${height}px`,
      className: `absolute left-1 right-1 rounded-xl p-2 text-xs border-l-4 shadow-sm z-10 cursor-pointer overflow-hidden transition-all hover:brightness-95 ${bgClass}`
    };
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Date Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-card border border-border rounded-2xl p-4 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => changeDate(-1)} className="p-2 bg-background border border-border rounded-full hover:bg-bg-tertiary transition-all active:scale-95 text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center min-w-[150px]">
            <h2 className="font-bold text-lg text-foreground capitalize">{formattedDate}</h2>
          </div>
          <button onClick={() => changeDate(1)} className="p-2 bg-background border border-border rounded-full hover:bg-bg-tertiary transition-all active:scale-95 text-foreground">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button onClick={() => { setSelectedSlot(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-glow hover:bg-primary-hover transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Novo Agendamento
        </button>
      </div>

      {/* Grid */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="animate-pulse font-bold text-muted-foreground">Carregando agenda...</div>
          </div>
        )}

        {/* Header Barbers */}
        <div className="flex border-b border-border bg-bg-tertiary/50">
          <div className="w-[70px] shrink-0 border-r border-border flex items-center justify-center">
            <Clock className="w-4 h-4 text-muted-foreground opacity-50" />
          </div>
          <div className="flex flex-1">
            {barbers.map((barber: any) => (
              <div key={barber.id} className="flex-1 text-center py-3 border-r border-border last:border-r-0">
                <div className="font-bold text-sm text-foreground flex items-center justify-center gap-2">
                  <User className="w-4 h-4 text-primary" /> {barber.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Body Grid */}
        <div className="flex relative h-[600px] overflow-y-auto">
          
          {/* Times Column */}
          <div className="w-[70px] shrink-0 border-r border-border bg-background">
            {timeSlots.map((time, idx) => (
              <div key={idx} className="h-[60px] flex items-start justify-center pt-2 border-b border-border/50 text-xs font-bold text-muted-foreground">
                {time}
              </div>
            ))}
          </div>

          {/* Barbers Columns */}
          <div className="flex flex-1 relative bg-background">
            {/* Linhas horizontais de grade */}
            <div className="absolute inset-0 pointer-events-none">
              {timeSlots.map((_, idx) => (
                <div key={idx} className="h-[60px] border-b border-border/50 w-full"></div>
              ))}
            </div>

            {/* Colunas verticais */}
            {barbers.map((barber: any) => {
              const barberAppointments = appointments.filter(a => a.barberId === barber.id);

              return (
                <div key={barber.id} className="flex-1 relative border-r border-border last:border-r-0">
                  {/* Slots clicáveis (vazios) */}
                  {timeSlots.map((time, idx) => (
                    <div 
                      key={idx} 
                      className="absolute w-full h-[60px] hover:bg-primary/5 cursor-pointer z-0 transition-colors"
                      style={{ top: `${idx * 60}px` }}
                      onClick={() => handleSlotClick(time, barber.id)}
                    ></div>
                  ))}

                  {/* Blocos de Agendamentos */}
                  {barberAppointments.map(app => {
                    const style = getAppointmentStyle(app);
                    return (
                      <div key={app.id} className={style.className} style={{ top: style.top, height: style.height }}>
                        <div className="font-bold truncate">{app.customer.name}</div>
                        <div className="truncate opacity-80 mt-0.5">{app.service.name}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Reutilizando Modal Atual */}
      <AppointmentModal 
        customers={customers} 
        barbers={barbers} 
        services={services} 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSlot={selectedSlot}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchAppointments(currentDate);
        }}
      />
    </div>
  );
}
