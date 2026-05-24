"use client";

import { useState } from "react";
import { createCustomer } from "@/app/actions";

export default function CustomerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createCustomer(formData);
      setIsOpen(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary">+ Novo Cliente</button>
      
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '0 1rem' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl m-0">Adicionar Cliente</h2>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="input-group">
                <label>Nome Completo</label>
                <input type="text" name="name" className="input" placeholder="Ex: João da Silva" required />
              </div>
              <div className="input-group">
                <label>WhatsApp</label>
                <input type="text" name="phone" className="input" placeholder="Ex: 11999999999" required />
              </div>
              
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
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
