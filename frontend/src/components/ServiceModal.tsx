"use client";

import { useState, useEffect } from "react";
import { saveService } from "@/app/actions";

export default function ServiceModal({ serviceToEdit, onClose }: { serviceToEdit?: any, onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(!!serviceToEdit);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (serviceToEdit) {
      setIsOpen(true);
    }
  }, [serviceToEdit]);

  function handleClose() {
    setIsOpen(false);
    if (onClose) onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (serviceToEdit) {
      formData.append("id", serviceToEdit.id);
    }
    
    try {
      await saveService(formData);
      handleClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!serviceToEdit && (
        <button onClick={() => setIsOpen(true)} className="btn btn-primary">+ Novo Serviço</button>
      )}
      
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '0 1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl m-0">{serviceToEdit ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button type="button" onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="input-group">
                <label>Nome do Serviço</label>
                <input type="text" name="name" className="input" placeholder="Ex: Corte Degradê" defaultValue={serviceToEdit?.name} required />
              </div>

              <div className="input-group">
                <label>Descrição</label>
                <textarea name="description" className="input" rows={2} placeholder="Detalhes do serviço..." defaultValue={serviceToEdit?.description}></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input-group">
                  <label>Preço (R$)</label>
                  <input type="number" step="0.01" name="price" className="input" placeholder="0.00" defaultValue={serviceToEdit?.price} required />
                </div>
                <div className="input-group">
                  <label>Duração (Minutos)</label>
                  <input type="number" name="durationMinutes" className="input" placeholder="45" defaultValue={serviceToEdit?.durationMinutes} required />
                </div>
              </div>

              <div className="input-group">
                <label>Pontos de Fidelidade Ganhos</label>
                <input type="number" name="pointsEarned" className="input" placeholder="Ex: 10" defaultValue={serviceToEdit?.pointsEarned || 0} />
                <span className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '4px' }}>Quantos pontos o cliente ganha ao realizar este serviço.</span>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={handleClose} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
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
