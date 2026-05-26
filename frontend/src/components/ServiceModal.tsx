"use client";

import { useState, useEffect } from "react";
import { saveService } from "@/app/actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { X, Plus, Edit2 } from "lucide-react";

const serviceSchema = z.object({
  name: z.string().min(3, "Nome do serviço deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  durationMinutes: z.number().min(1, "Duração é obrigatória"),
  price: z.number().min(0, "Preço inválido"),
  pointsEarned: z.number().min(0),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function ServiceModal({ serviceToEdit, onClose }: { serviceToEdit?: any, onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(!!serviceToEdit);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      durationMinutes: 45,
      pointsEarned: 0,
    }
  });

  useEffect(() => {
    if (serviceToEdit) {
      setIsOpen(true);
      setValue("name", serviceToEdit.name);
      setValue("description", serviceToEdit.description || "");
      setValue("price", Number(serviceToEdit.price));
      setValue("durationMinutes", serviceToEdit.durationMinutes);
      setValue("pointsEarned", serviceToEdit.pointsEarned || 0);
    } else {
      reset();
    }
  }, [serviceToEdit, setValue, reset]);

  function handleClose() {
    setIsOpen(false);
    reset();
    if (onClose) onClose();
  }

  async function onSubmit(data: ServiceFormData) {
    setLoading(true);
    const formData = new FormData();
    if (serviceToEdit) {
      formData.append("id", serviceToEdit.id);
    }
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("price", data.price.toString());
    formData.append("durationMinutes", data.durationMinutes.toString());
    formData.append("pointsEarned", data.pointsEarned.toString());
    
    try {
      await saveService(formData);
      toast.success(serviceToEdit ? "Serviço atualizado com sucesso!" : "Serviço criado com sucesso!");
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar serviço");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!serviceToEdit && (
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all active:scale-95 border-t border-blue-400/30">
          <Plus className="w-4 h-4" /> Novo Serviço
        </button>
      )}
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                {serviceToEdit ? <Edit2 className="w-5 h-5 text-blue-400" /> : <Plus className="w-5 h-5 text-blue-400" />}
                {serviceToEdit ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button type="button" onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome do Serviço</label>
                <input 
                  type="text" 
                  {...register("name")} 
                  className={`input ${errors.name ? 'border-red-500' : ''}`} 
                  placeholder="Ex: Corte Degradê" 
                />
                {errors.name && <span className="text-red-500 text-xs font-medium">{errors.name.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição</label>
                <textarea 
                  {...register("description")} 
                  className="input min-h-[80px] resize-none" 
                  rows={2} 
                  placeholder="Detalhes do serviço..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    {...register("price", { valueAsNumber: true })} 
                    className={`input ${errors.price ? 'border-red-500' : ''}`} 
                    placeholder="0.00" 
                  />
                  {errors.price && <span className="text-red-500 text-xs font-medium">{errors.price.message}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duração (Minutos)</label>
                  <input 
                    type="number" 
                    {...register("durationMinutes", { valueAsNumber: true })} 
                    className={`input ${errors.durationMinutes ? 'border-red-500' : ''}`} 
                    placeholder="45" 
                  />
                  {errors.durationMinutes && <span className="text-red-500 text-xs font-medium">{errors.durationMinutes.message}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pontos de Fidelidade Ganhos</label>
                <input 
                  type="number" 
                  {...register("pointsEarned", { valueAsNumber: true })} 
                  className={`input ${errors.pointsEarned ? 'border-red-500' : ''}`} 
                  placeholder="Ex: 10" 
                />
                {errors.pointsEarned && <span className="text-red-500 text-xs font-medium">{errors.pointsEarned.message}</span>}
                <span className="text-[11px] text-slate-500">Quantos pontos o cliente ganha ao realizar este serviço.</span>
              </div>
              
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <button type="button" onClick={handleClose} className="px-5 py-2.5 bg-slate-800 border border-white/10 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all border-t border-blue-400/30" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
