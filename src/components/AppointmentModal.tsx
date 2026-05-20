"use client";

import { useState } from "react";
import { createAppointment } from "@/app/actions";

export default function AppointmentModal({ customers, barbers, services }: { customers: any[], barbers: any[], services: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createAppointment(formData);
      setIsOpen(false);
      alert("Agendamento criado com sucesso! O cliente receberá o WhatsApp.");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary">+ Novo Agendamento</button>
      
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '0 1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl m-0">Novo Agendamento</h2>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="input-group">
                <label>Cliente</label>
                <select name="customerId" className="input" required>
                  <option value="">Selecione o Cliente</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              <div className="input-group">
                <label>Barbeiro</label>
                <select name="barberId" className="input" required>
                  <option value="">Selecione o Barbeiro</option>
                  {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label>Serviço</label>
                <select name="serviceId" className="input" required>
                  <option value="">Selecione o Serviço</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input-group">
                  <label>Data</label>
                  <input type="date" name="date" className="input" required />
                </div>
                <div className="input-group">
                  <label>Horário Início</label>
                  <input type="time" name="startTime" className="input" required />
                </div>
              </div>
              <div className="input-group">
                <label>Horário Fim (Previsto)</label>
                <input type="time" name="endTime" className="input" required />
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando e Notificando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
