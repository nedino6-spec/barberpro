"use client";

import { useState, useEffect } from "react";
import { saveCustomer } from "@/app/actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { X, UserPlus, Edit2 } from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  phone: z.string().transform(val => val.replace(/\D/g, '')).pipe(z.string().min(10, "O telefone deve ter no mínimo 10 dígitos (Ex: 11999999999)")),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CustomerModal({ customerToEdit, onClose }: { customerToEdit?: any, onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(!!customerToEdit);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: ""
    }
  });

  useEffect(() => {
    if (customerToEdit) {
      setIsOpen(true);
      setValue("name", customerToEdit.name);
      setValue("phone", customerToEdit.phone);
    } else {
      reset();
    }
  }, [customerToEdit, setValue, reset]);

  function handleClose() {
    setIsOpen(false);
    reset();
    if (onClose) onClose();
  }

  async function onSubmit(data: CustomerFormData) {
    setLoading(true);
    const formData = new FormData();
    if (customerToEdit) {
      formData.append("id", customerToEdit.id);
    }
    formData.append("name", data.name);
    formData.append("phone", data.phone);

    try {
      await saveCustomer(formData);
      toast.success(customerToEdit ? "Cliente atualizado com sucesso!" : "Cliente salvo com sucesso!");
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!customerToEdit && (
        <button onClick={() => setIsOpen(true)} className="w-full md:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-2 border-t border-blue-400/30">
          <UserPlus className="w-4 h-4" /> Novo Cliente
        </button>
      )}
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                {customerToEdit ? <Edit2 className="w-5 h-5 text-blue-400" /> : <UserPlus className="w-5 h-5 text-blue-400" />}
                {customerToEdit ? "Editar Cliente" : "Adicionar Cliente"}
              </h2>
              <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome Completo</label>
                <input 
                  type="text" 
                  {...register("name")} 
                  className={`input ${errors.name ? 'border-red-500' : ''}`} 
                  placeholder="Ex: João da Silva" 
                />
                {errors.name && <span className="text-red-500 text-xs font-medium">{errors.name.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp</label>
                <input 
                  type="text" 
                  {...register("phone")} 
                  className={`input ${errors.phone ? 'border-red-500' : ''}`} 
                  placeholder="Ex: 11999999999" 
                />
                {errors.phone && <span className="text-red-500 text-xs font-medium">{errors.phone.message}</span>}
              </div>
              
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <button type="button" onClick={handleClose} className="px-5 py-2.5 bg-slate-800 border border-white/10 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all border-t border-blue-400/30" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
