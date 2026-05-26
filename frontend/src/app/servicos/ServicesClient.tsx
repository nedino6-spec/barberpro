"use client";

import { useState } from "react";
import ServiceModal from "@/components/ServiceModal";
import { toggleServiceStatus } from "@/app/actions";
import { Edit2 } from "lucide-react";

export default function ServicesClient({ services }: { services: any[] }) {
  const [editingService, setEditingService] = useState<any | null>(null);

  const handleToggle = async (id: string, active: boolean) => {
    await toggleServiceStatus(id, !active);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-6 shadow-xl mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Catálogo de Serviços</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-sm">
              <th className="py-3 px-4 font-medium">Serviço</th>
              <th className="py-3 px-4 font-medium">Duração</th>
              <th className="py-3 px-4 font-medium">Preço</th>
              <th className="py-3 px-4 font-medium">Pontos (Ganha)</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Nenhum serviço cadastrado.
                </td>
              </tr>
            )}
            {services.map((service) => (
              <tr key={service.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-white group">
                <td className="py-4 px-4">
                  <div className="font-bold">{service.name}</div>
                  {service.description && <div className="text-xs text-slate-400 mt-1">{service.description}</div>}
                </td>
                <td className="py-4 px-4 text-slate-300 font-medium">{service.durationMinutes} min</td>
                <td className="py-4 px-4 font-bold text-emerald-400">R$ {service.price.toFixed(2)}</td>
                <td className="py-4 px-4 text-blue-400 font-medium">+{service.pointsEarned} pts</td>
                <td className="py-4 px-4">
                  <button 
                    onClick={() => handleToggle(service.id, service.active)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-colors ${service.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'}`}
                  >
                    {service.active ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="py-4 px-4 text-right">
                  <button onClick={() => setEditingService(service)} className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingService && (
        <ServiceModal serviceToEdit={editingService} onClose={() => setEditingService(null)} />
      )}
    </div>
  );
}
