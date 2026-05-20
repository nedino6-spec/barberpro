import AppointmentModal from "@/components/AppointmentModal";
import { prisma } from "@/lib/prisma";

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
    <div>
      <div className="page-header">
        <h1 className="page-title">Agenda Inteligente</h1>
        <div className="flex gap-4">
          <button className="btn btn-secondary">Selecionar Barbeiro</button>
          <AppointmentModal customers={customers} barbers={barbers} services={services} />
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex gap-4 items-center">
            <button className="btn btn-secondary">&lt;</button>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Hoje</h2>
            <button className="btn btn-secondary">&gt;</button>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary">Dia</button>
            <button className="btn btn-secondary">Semana</button>
          </div>
        </div>

        {/* Renderização real da Agenda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          
          {appointments.length === 0 && (
            <div style={{ padding: '2rem', backgroundColor: 'var(--bg-primary)', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Nenhum agendamento para hoje.
            </div>
          )}

          {appointments.map(app => (
            <div key={app.id} style={{ display: 'flex', backgroundColor: 'var(--bg-primary)' }}>
              <div style={{ width: '100px', padding: '1rem', borderRight: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: 600 }}>
                {app.startTime} - {app.endTime}
              </div>
              <div style={{ flex: 1, padding: '0.5rem' }}>
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--success)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.customer.name} - {app.service.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Com: {app.barber.name} | Status: {app.status === 'CONFIRMED' ? 'Confirmado (WhatsApp Enviado)' : app.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
        </div>
      </div>
    </div>
  );
}
