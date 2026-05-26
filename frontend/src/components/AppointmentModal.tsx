"use client";

import { useState, useEffect } from "react";
import { createAppointment } from "@/app/actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

const appointmentSchema = z.object({
  customerId: z.string().min(1, "Selecione um cliente"),
  barberId: z.string().min(1, "Selecione um barbeiro"),
  serviceId: z.string().min(1, "Selecione um serviço"),
  date: z.string().min(1, "A data é obrigatória"),
  startTime: z.string().min(1, "O horário de início é obrigatório"),
  endTime: z.string().min(1, "O horário de fim é obrigatório"),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

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
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customerId: "",
      barberId: initialSlot?.barberId || "",
      serviceId: "",
      date: initialSlot?.date || new Date().toISOString().split('T')[0],
      startTime: initialSlot?.time || "",
      endTime: "",
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialSlot) {
        setValue("barberId", initialSlot.barberId);
        setValue("date", initialSlot.date || new Date().toISOString().split('T')[0]);
        setValue("startTime", initialSlot.time);
      }
    } else {
      reset();
    }
  }, [isOpen, initialSlot, setValue, reset]);

  const handleClose = () => {
    reset();
    if (onClose) onClose();
    else setInternalIsOpen(false);
  };

  async function onSubmit(data: AppointmentFormData) {
    setLoading(true);
    const formData = new FormData();
    formData.append("customerId", data.customerId);
    formData.append("barberId", data.barberId);
    formData.append("serviceId", data.serviceId);
    formData.append("date", data.date);
    formData.append("startTime", data.startTime);
    formData.append("endTime", data.endTime);

    try {
      await createAppointment(formData);
      toast.success("Agendamento criado com sucesso! O cliente receberá o WhatsApp.");
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar agendamento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {externalIsOpen === undefined && (
        <button onClick={() => setInternalIsOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all active:scale-95 border-t border-blue-400/30">
          + Novo Agendamento
        </button>
      )}
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 m-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                Novo Agendamento
              </h2>
              <button onClick={handleClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</label>
                <select 
                  {...register("customerId")} 
                  className={`input ${errors.customerId ? 'border-red-500' : ''}`}
                >
                  <option value="">Selecione o Cliente</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
                {errors.customerId && <span className="text-red-500 text-xs font-medium">{errors.customerId.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Barbeiro</label>
                <select 
                  {...register("barberId")} 
                  className={`input ${errors.barberId ? 'border-red-500' : ''}`}
                >
                  <option value="">Selecione o Barbeiro</option>
                  {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {errors.barberId && <span className="text-red-500 text-xs font-medium">{errors.barberId.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Serviço</label>
                <select 
                  {...register("serviceId")} 
                  className={`input ${errors.serviceId ? 'border-red-500' : ''}`}
                >
                  <option value="">Selecione o Serviço</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                </select>
                {errors.serviceId && <span className="text-red-500 text-xs font-medium">{errors.serviceId.message}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data</label>
                  <input 
                    type="date" 
                    {...register("date")} 
                    className={`input ${errors.date ? 'border-red-500' : ''}`} 
                  />
                  {errors.date && <span className="text-red-500 text-xs font-medium">{errors.date.message}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horário Início</label>
                  <input 
                    type="time" 
                    {...register("startTime")} 
                    className={`input ${errors.startTime ? 'border-red-500' : ''}`} 
                  />
                  {errors.startTime && <span className="text-red-500 text-xs font-medium">{errors.startTime.message}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horário Fim (Previsto)</label>
                <input 
                  type="time" 
                  {...register("endTime")} 
                  className={`input ${errors.endTime ? 'border-red-500' : ''}`} 
                />
                {errors.endTime && <span className="text-red-500 text-xs font-medium">{errors.endTime.message}</span>}
              </div>
              
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <button type="button" onClick={handleClose} className="px-5 py-2.5 bg-slate-800 border border-white/10 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all border-t border-blue-400/30" disabled={loading}>
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
