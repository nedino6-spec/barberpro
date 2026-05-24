const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const QRCode = require('qrcode');
const path = require('path');
const pino = require('pino');
const { PrismaClient } = require('@prisma/client');
const usePrismaAuthState = require('./prisma-auth');

// Inicializa o Worker do Google Sync em Background
require('./worker');

const prisma = new PrismaClient();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, { cors: { origin: '*' } });

const API_BASE_URL = 'https://barberpro-tau.vercel.app/api/bot';

let state = { status: 'STARTING', qr: null, qrImage: null };
let globalSock = null; // Referência global para enviar mensagens pela API externa

function updateState(newState) {
  state = { ...state, ...newState };
  console.log(`[WhatsApp] Status: ${state.status}`);
  io.emit('status_update', state);
}

const userSessions = {};

async function startBot() {
  const { state: authState, saveCreds } = await usePrismaAuthState(prisma);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: authState,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    browser: ['BarberPro', 'Chrome', '1.0.0'],
  });

  globalSock = sock;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        const qrImage = await QRCode.toDataURL(qr);
        updateState({ status: 'AWAITING_QR', qr, qrImage });
      } catch (e) {
        updateState({ status: 'AWAITING_QR', qr, qrImage: null });
      }
    }

    if (connection === 'close') {
      globalSock = null;
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log('[WhatsApp] Conexão fechada. Motivo:', reason);

      if (reason === DisconnectReason.loggedOut) {
        updateState({ status: 'DISCONNECTED', qr: null, qrImage: null });
        setTimeout(startBot, 3000);
      } else {
        updateState({ status: 'RECONNECTING', qr: null, qrImage: null });
        setTimeout(startBot, 5000);
      }
    }

    if (connection === 'open') {
      updateState({ status: 'CONNECTED', qr: null, qrImage: null });
      console.log('[WhatsApp] ✅ Conectado com sucesso!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      if (from.endsWith('@g.us')) continue; // Ignora grupos
      const phoneOnly = from.split('@')[0];

      const text = (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        ''
      ).toLowerCase().trim();

      if (!userSessions[from]) userSessions[from] = { step: 0 };
      const session = userSessions[from];

      const send = (txt) => sock.sendMessage(from, { text: txt });

      if (['oi', 'olá', 'ola', 'ola!', 'oi!', 'menu'].includes(text)) {
        session.step = 1;
        await send(`Olá! Bem-vindo(a) à *BarberPro* ✂️\n\nComo posso te ajudar hoje?\n\n1️⃣ Entrar na fila (Agora)\n2️⃣ Agendar um horário (Futuro)\n3️⃣ Ver nosso catálogo\n4️⃣ Minha posição na fila\n5️⃣ Meus pontos de fidelidade\n6️⃣ Sobre nosso Clube VIP\n7️⃣ Avaliar atendimento\n8️⃣ Sair`);
        continue;
      }

      if (session.step === 7) {
        // Aguardando nota
        const nota = parseInt(text);
        if (nota >= 1 && nota <= 5) {
          try {
            await fetch(`${API_BASE_URL}/review`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone: phoneOnly, rating: nota })
            });
            await send(`Obrigado pela sua avaliação de ${nota} estrelas! Isso nos ajuda muito. ⭐`);
          } catch(e) {
            await send(`Obrigado! Avaliação registrada.`);
          }
        } else {
          await send(`Por favor, digite apenas um número de 1 a 5.`);
        }
        session.step = 0;
        continue;
      }

      if (session.step === 1) {
        if (text === '1') {
          try {
            const res = await fetch(`${API_BASE_URL}/queue`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone: phoneOnly, name: msg.pushName || 'Cliente' })
            });
            const data = await res.json();
            if (data.error) await send(`⚠️ ${data.error}`);
            else await send(`🚶 *Fila Virtual*\nVocê entrou na fila! ✅\nSua posição atual é a *${data.position}ª*.\nFique atento: Avisaremos quando você for o 3º da fila!`);
          } catch(e) {
             await send(`Erro ao entrar na fila, tente novamente.`);
          }
          session.step = 0;
        } else if (text === '2') {
          await send(`🗓️ *Agendamento*\nPor favor, digite o *dia e horário* da sua preferência para verificarmos a disponibilidade na agenda.`);
          session.step = 0;
        } else if (text === '3') {
          await sock.sendMessage(from, { 
            image: { url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600' }, 
            caption: `✂️ *Catálogo de Serviços*\n- Corte Degradê: R$ 45,00\n- Barba Terapia: R$ 35,00\n- Corte + Barba: R$ 70,00\n- Sobrancelha: R$ 15,00\n\nResponda com o serviço desejado!` 
          });
          session.step = 0;
        } else if (text === '4' || text === '5') {
          try {
            const res = await fetch(`${API_BASE_URL}/customer?phone=${phoneOnly}`);
            const data = await res.json();
            if (data.error) {
              await send(`⚠️ Você ainda não possui cadastro. Digite 1 para entrar na fila e criar seu perfil automaticamente!`);
            } else {
              if (text === '4') {
                const pos = data.customer.queuePosition;
                if (pos) await send(`⏳ *Posição na Fila*\nVocê está na *${pos}ª* posição no momento.`);
                else await send(`Você não está na fila no momento.`);
              } else if (text === '5') {
                let txt = `🎁 *Fidelidade*\nVocê possui *${data.customer.points} Pontos* (${data.customer.vipLevel})!\nFalta pouco para ganhar seu prêmio! 🎉`;
                if (data.customer.debtBalance > 0) {
                  txt += `\n\n⚠️ *Aviso Financeiro*\nVocê possui um saldo pendente (fiado) de *R$ ${data.customer.debtBalance.toFixed(2)}*. Por favor, consulte o balcão.`;
                }
                await send(txt);
              }
            }
          } catch(e) {
            await send(`Erro ao buscar dados. Tente novamente.`);
          }
          session.step = 0;
        } else if (text === '6') {
          await send(`👑 *Clube VIP BarberPro*\nAssine nosso clube e ganhe:\n- Cortes ilimitados no mês\n- 20% OFF em produtos\n- Bebida cortesia\nFale com nossos barbeiros para aderir!`);
          session.step = 0;
        } else if (text === '7') {
          session.step = 7;
          await send(`⭐ *Avaliação*\nDe 1 a 5, que nota você dá para o seu último atendimento? (Digite apenas o número)`);
        } else if (text === '8') {
          await send(`👋 *Saindo*\nObrigado por falar conosco! Se precisar, é só digitar *menu* novamente.`);
          session.step = 0;
        } else {
          await send(`Desculpe, não entendi. Por favor, escolha um número de 1 a 8 ou digite *menu*.`);
        }
        continue;
      }

      // Resposta padrão
      if (text.length > 0) {
        await send(`Olá! Digite *menu* para ver como posso te ajudar. ✂️`);
      }
    }
  });

  return sock;
}

// Rota de status
app.get('/status', (req, res) => {
  res.json({
    status: state.status,
    qr: state.qr || null,
    qrImage: state.qrImage || null,
  });
});

// ======== ENDPOINTS DO BOT ======== //

app.post('/broadcast', (req, res) => {
  const { event, data } = req.body;
  if (!event) return res.status(400).json({ error: "event is required" });
  io.emit(event, data);
  res.json({ success: true, event });
});

app.post('/send', async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) return res.status(400).json({ error: 'Número e mensagem são obrigatórios' });
    if (!globalSock) return res.status(503).json({ error: 'Bot desconectado' });
    
    // Formatar número para o formato do WhatsApp (BR)
    let formatNumber = phone;
    if (!formatNumber.includes('@s.whatsapp.net')) {
      formatNumber = `${phone}@s.whatsapp.net`;
    }

    await globalSock.sendMessage(formatNumber, { text: message });
    res.json({ success: true, note: 'Mensagem enviada com sucesso!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get('/', (req, res) => res.json({ ok: true, service: 'BarberPro Bot' }));

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BarberPro Bot rodando na porta ${PORT}`);
  startBot().catch(console.error);
});
