"use client";

import { useState } from "react";
import ServiceModal from "@/components/ServiceModal";
import { toggleServiceStatus } from "@/app/actions";

export default function ServicesClient({ services }: { services: any[] }) {
  const [editingService, setEditingService] = useState<any | null>(null);

  const handleToggle = async (id: string, active: boolean) => {
    await toggleServiceStatus(id, !active);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl">Catálogo de Serviços</h2>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <th style={{ padding: '1rem' }}>Serviço</th>
              <th style={{ padding: '1rem' }}>Duração</th>
              <th style={{ padding: '1rem' }}>Preço</th>
              <th style={{ padding: '1rem' }}>Pontos (Ganha)</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Nenhum serviço cadastrado.
                </td>
              </tr>
            )}
            {services.map((service) => (
              <tr key={service.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>
                  {service.name}
                  {service.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{service.description}</div>}
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{service.durationMinutes} min</td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>R$ {service.price.toFixed(2)}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>+{service.pointsEarned} pts</td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    onClick={() => handleToggle(service.id, service.active)}
                    className={`badge ${service.active ? 'badge-success' : ''}`} 
                    style={{ background: service.active ? '' : 'var(--border-color)', color: service.active ? '' : 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
                  >
                    {service.active ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => setEditingService(service)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    Editar
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
