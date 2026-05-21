import AppointmentModal from "@/components/AppointmentModal";
import { prisma } from "@/lib/prisma";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, Clock, MessageCircle } from "lucide-react";

export const revalidate = 0;

export default async function AgendaPage() {
  const customers = await prisma.customer.findMany();
  const barbers = await prisma.user.findMany({ where: { role: 'BARBER' } });
  const services = await prisma.service.findMany({ where: { active: true } });

  const appointments = await prisma.appointment.findMany({
    include: { customer: true, barber: true, service: true },
    orderBy: { startTime: 'asc' }
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header Fila */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Agenda Inteligente
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie seus horários com facilidade.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <AppointmentModal customers={customers} barbers={barbers} services={services} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm">
        {/* Controle de Datas */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3 bg-background rounded-full p-1 border border-border w-full sm:w-auto justify-between sm:justify-start">
            <button className="p-2 rounded-full hover:bg-card active:scale-95 transition-all text-muted-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-lg min-w-[120px] text-center">Hoje, 20 Mai</h2>
            <button className="p-2 rounded-full hover:bg-card active:scale-95 transition-all text-muted-foreground">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-2 bg-background p-1 rounded-xl border border-border w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-1.5 bg-card text-foreground rounded-lg text-sm font-semibold shadow-sm">Dia</button>
            <button className="flex-1 sm:flex-none px-4 py-1.5 text-muted-foreground rounded-lg text-sm font-medium hover:text-foreground transition-colors">Semana</button>
          </div>
        </div>

        {/* Lista de Agendamentos (Timeline view) */}
        <div className="flex flex-col relative">
          {/* Linha vertical central para timeline (opcional visualmente) */}
          <div className="absolute left-[70px] md:left-[80px] top-0 bottom-0 w-px bg-border hidden sm:block"></div>
          
          {appointments.length === 0 && (
            <div className="py-12 text-center text-muted-foreground bg-background rounded-xl border border-dashed border-border flex flex-col items-center justify-center">
              <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
              <p>Nenhum agendamento para hoje.</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {appointments.map(app => (
              <div key={app.id} className="flex gap-3 md:gap-6 relative z-10">
                {/* Horário */}
                <div className="w-[60px] md:w-[70px] shrink-0 text-right pt-2">
                  <div className="text-sm font-bold text-foreground">{app.startTime}</div>
                  <div className="text-[10px] text-muted-foreground">{app.endTime}</div>
                </div>

                {/* Bolinha da timeline (Desktop) */}
                <div className="hidden sm:flex mt-3 w-3 h-3 rounded-full bg-primary ring-4 ring-card z-10 shrink-0"></div>

                {/* Card do Agendamento */}
                <div className="flex-1 bg-background border border-border rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-success rounded-l-2xl"></div>
                  
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pl-2">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{app.customer.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <User className="w-3.5 h-3.5" /> {app.barber.name}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <Clock className="w-3.5 h-3.5" /> {app.service.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-success bg-success/10">
                        {app.status === 'CONFIRMED' ? 'Confirmado' : app.status}
                      </span>
                      <button className="p-2 bg-success/10 text-success hover:bg-success hover:text-white rounded-full transition-colors active:scale-95">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
