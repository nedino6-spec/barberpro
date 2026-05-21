"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { addToQueue, completeQueueItem } from "./actions";

let socket: Socket;

export default function FilaVirtualPage({ initialQueue }: { initialQueue: any[] }) {
  const [queue, setQueue] = useState(initialQueue || []);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // Conectar ao WebSocket (usa a env no Vercel ou localhost local)
    const wsUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || "http://localhost:3001";
    socket = io(wsUrl);

    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    // Escutar eventos de atualização de fila disparados pelo Backend
    socket.on("queue_updated", (newData: any) => {
      // Aqui em produção nós faríamos um fetch() para pegar a nova fila atualizada do Prisma
      // Para demonstração, vamos apenas forçar reload
      window.location.reload();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  async function handleComplete(id: string) {
    await completeQueueItem(id);
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl">Fila Virtual em Tempo Real</h2>
          <span className={`text-sm ${socketConnected ? 'text-success' : 'text-danger'}`}>
            {socketConnected ? '🟢 WebSocket Conectado (Live)' : '🔴 WebSocket Desconectado'}
          </span>
        </div>
        
        {/* Formulário para entrar na fila (Geralmente feito pelo Totem ou Chatbot) */}
        <form action={addToQueue} className="flex gap-2">
           <input type="text" name="customerId" placeholder="ID do Cliente..." className="input" required />
           <button type="submit" className="btn btn-primary">+ Entrar na Fila</button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {queue.length === 0 && <p className="text-secondary text-center">A fila está vazia no momento.</p>}
        
        {queue.map((item, index) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent)' }}>
            <div style={{ width: '50px', fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
              {index + 1}º
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '1.1rem' }}>{item.customer?.name || "Cliente " + item.customerId}</strong>
              <div className="text-secondary">Espera estimada: {item.estimatedWaitMins} minutos</div>
            </div>
            <div>
              <span className="badge badge-warning" style={{ marginRight: '1rem' }}>{item.status}</span>
              <button onClick={() => handleComplete(item.id)} className="btn btn-secondary">Chamar / Finalizar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
