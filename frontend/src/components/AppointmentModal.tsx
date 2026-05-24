"use client";

import { useState, useEffect } from "react";
import { createAppointment } from "@/app/actions";

export default function AppointmentModal({ 
  customers, 
  barbers, 
  services,
  isOpen: externalIsOpen,
  onClose,
  initialSlot,
  onSuccess
}: { 
  customers: any[], 
  barbers: any[], 
  services: any[],
  isOpen?: boolean,
  onClose?: () => void,
  initialSlot?: { time: string, barberId: string, date?: string } | null,
  onSuccess?: () => void
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const handleClose = () => {
    if (onClose) onClose();
    else setInternalIsOpen(false);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createAppointment(formData);
      handleClose();
      if (onSuccess) onSuccess();
      else alert("Agendamento criado com sucesso! O cliente receberá o WhatsApp.");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {externalIsOpen === undefined && (
        <button onClick={() => setInternalIsOpen(true)} className="btn btn-primary">+ Novo Agendamento</button>
      )}
      
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-2xl p-5 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Novo Agendamento</h2>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cliente</label>
                <select name="customerId" className="bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-primary" required>
                  <option value="">Selecione o Cliente</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Barbeiro</label>
                <select name="barberId" defaultValue={initialSlot?.barberId || ""} className="bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-primary" required>
                  <option value="">Selecione o Barbeiro</option>
                  {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Serviço</label>
                <select name="serviceId" className="bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-primary" required>
                  <option value="">Selecione o Serviço</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Data</label>
                  <input type="date" name="date" defaultValue={initialSlot?.date || new Date().toISOString().split('T')[0]} className="bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-primary" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Horário Início</label>
                  <input type="time" name="startTime" defaultValue={initialSlot?.time || ""} className="bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-primary" required />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Horário Fim (Previsto)</label>
                <input type="time" name="endTime" className="bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-primary" required />
              </div>
              
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                <button type="button" onClick={handleClose} className="px-4 py-2.5 bg-background border border-border rounded-xl font-medium hover:bg-bg-tertiary transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-glow transition-all" disabled={loading}>
                  {loading ? 'Salvando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
