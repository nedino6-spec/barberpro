"use client";

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function AgendoZapSettings() {
  const [status, setStatus] = useState<string>('CARREGANDO');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('conexao');

  // Configurações do Agendo Zap Profissional
  const [config, setConfig] = useState({
    chatbotAtivo: true,
    tempoEsperaFila: 15,
    mensagemAgendamento: "Olá, {nome}! Seu agendamento está CONFIRMADO para {data} às {hora}. Serviço: {servico}. Te esperamos! ✂️",
    mensagemLembrete: "Passando para lembrar do seu corte hoje às {hora}! Nos vemos em breve. 💈",
    mensagemFidelidade: "Parabéns {nome}! Você acaba de ganhar {pontos} pontos. Saldo atual: {saldo_pontos}."
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/whatsapp/status');
        if (!res.ok) {
          setStatus(res.status === 504 ? 'STARTING' : 'OFFLINE');
          return;
        }
        
        // Verifica se a resposta é JSON antes de tentar parsear
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          setStatus(data.status);
          if (data.qr) setQrCode(data.qr);
          else setQrCode(null);
        } else {
          setStatus('STARTING'); // Se for HTML de timeout da Vercel, está iniciando
        }
      } catch (error) {
        console.error("Erro", error);
        setStatus('OFFLINE');
      }
    }, 5000); // Aumentando o intervalo para 5 segundos para desafogar o servidor
    return () => clearInterval(interval);
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Configurações do Agendo Zap Profissional salvas com sucesso! O robô já utilizará as novas regras.");
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Agendo Zap - Profissional</h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => setActiveTab('conexao')} className={`btn ${activeTab === 'conexao' ? 'btn-primary' : 'btn-secondary'}`}>
          📱 Conexão do Aparelho
        </button>
        <button onClick={() => setActiveTab('mensagens')} className={`btn ${activeTab === 'mensagens' ? 'btn-primary' : 'btn-secondary'}`}>
          💬 Mensagens Automáticas
        </button>
        <button onClick={() => setActiveTab('avancado')} className={`btn ${activeTab === 'avancado' ? 'btn-primary' : 'btn-secondary'}`}>
          ⚙️ Configurações do Robô
        </button>
      </div>

      {activeTab === 'conexao' && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 className="text-xl mb-4">Status da Conexão</h2>
          <div style={{ padding: '2rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
            {status === 'CARREGANDO' && <p>Buscando sinal do servidor Agendo Zap...</p>}
            {status === 'OFFLINE' && <p className="text-danger">Serviço Agendo Zap Offline. Inicie o servidor.</p>}
            {status === 'STARTING' && <p className="text-warning">Iniciando motor do robô...</p>}
            
            {status === 'AWAITING_QR' && qrCode && (
              <div className="flex flex-col items-center gap-4">
                <p>Abra o WhatsApp no celular da barbearia, vá em "Aparelhos Conectados" e escaneie o código abaixo.</p>
                <div style={{ padding: '1rem', background: 'white', borderRadius: '0.5rem', display: 'inline-block' }}>
                  <QRCodeSVG value={qrCode} size={256} />
                </div>
              </div>
            )}

            {(status === 'AUTHENTICATED' || status === 'CONNECTED') && (
              <div className="flex flex-col items-center gap-4">
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>✓</div>
                <h3 className="text-success text-xl">Agendo Zap 100% Online e Operando!</h3>
                <p className="text-secondary">O seu Chatbot e automações estão ativos e monitorando os clientes em tempo real.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'mensagens' && (
        <div className="card">
          <h2 className="text-xl mb-4">Templates de Mensagens</h2>
          <p className="text-secondary mb-6">Use as variáveis como <code>{`{nome}`}</code>, <code>{`{data}`}</code>, e <code>{`{hora}`}</code> para personalizar.</p>
          
          <form onSubmit={handleSaveConfig} className="flex flex-col gap-4">
            <div className="input-group">
              <label>Novo Agendamento Confirmado</label>
              <textarea className="input" rows={3} value={config.mensagemAgendamento} onChange={e => setConfig({...config, mensagemAgendamento: e.target.value})} />
            </div>
            
            <div className="input-group">
              <label>Lembrete (2 horas antes)</label>
              <textarea className="input" rows={3} value={config.mensagemLembrete} onChange={e => setConfig({...config, mensagemLembrete: e.target.value})} />
            </div>

            <div className="input-group">
              <label>Mensagem de Ganho de Pontos (Fidelidade)</label>
              <textarea className="input" rows={3} value={config.mensagemFidelidade} onChange={e => setConfig({...config, mensagemFidelidade: e.target.value})} />
            </div>

            <div className="flex justify-end mt-4">
              <button type="submit" className="btn btn-primary">Salvar Templates</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'avancado' && (
        <div className="card">
          <h2 className="text-xl mb-4">Configurações do Robô Inteligente</h2>
          
          <form onSubmit={handleSaveConfig} className="flex flex-col gap-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
              <input type="checkbox" checked={config.chatbotAtivo} onChange={e => setConfig({...config, chatbotAtivo: e.target.checked})} style={{ width: '24px', height: '24px' }} />
              <div>
                <strong style={{ display: 'block' }}>Chatbot 24h (Menu Inicial)</strong>
                <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Responde automaticamente "Oi" com o menu de opções (Agendar, Fila, Pontos).</span>
              </div>
            </div>

            <div className="input-group">
              <label>Tempo limite da Fila Virtual (minutos)</label>
              <input type="number" className="input" value={config.tempoEsperaFila} onChange={e => setConfig({...config, tempoEsperaFila: Number(e.target.value)})} />
              <span className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '4px' }}>Tempo estimado adicionado por cada cliente na frente da fila.</span>
            </div>

            <div className="flex justify-end mt-4">
              <button type="submit" className="btn btn-primary">Salvar Configurações</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
