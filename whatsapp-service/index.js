const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const QRCode = require('qrcode');
const path = require('path');
const pino = require('pino');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Estado em memória (sem arquivo - compatível com qualquer servidor)
let state = { status: 'STARTING', qr: null, qrImage: null };

function updateState(newState) {
  state = { ...state, ...newState };
  console.log(`[WhatsApp] Status: ${state.status}`);
  io.emit('status_update', state);
}

const SESSION_DIR = process.env.SESSION_PATH || path.join('/tmp', 'baileys_auth');
const userSessions = {};

async function startBot() {
  const { state: authState, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: authState,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    browser: ['BarberPro', 'Chrome', '1.0.0'],
  });

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
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log('[WhatsApp] Conexão fechada. Motivo:', reason);

      if (reason === DisconnectReason.loggedOut) {
        updateState({ status: 'DISCONNECTED', qr: null, qrImage: null });
        console.log('[WhatsApp] Sessão encerrada pelo usuário. Reiniciando...');
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

  // ---------------------------------------------------------
  // CHATBOT INTELIGENTE - AUTO RESPOSTA
  // ---------------------------------------------------------
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      if (from.endsWith('@g.us')) continue; // Ignora grupos

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

      if (session.step === 1) {
        if (text === '1') {
          await send(`🚶 *Fila Virtual*\nVocê foi adicionado à fila! ✅\nSua posição: *3º*\nTempo estimado: *45 min*.\nAvisaremos quando estiver quase na sua vez!`);
          session.step = 0;
        } else if (text === '2') {
          await send(`🗓️ *Agendamento*\nPor favor, digite o *dia e horário* da sua preferência para verificarmos a disponibilidade na agenda.`);
          session.step = 0;
        } else if (text === '3') {
          await send(`✂️ *Catálogo de Serviços*\n- Corte Degradê: R$ 45,00\n- Barba Terapia: R$ 35,00\n- Corte + Barba: R$ 70,00\n- Sobrancelha: R$ 15,00\n\nQual serviço você deseja realizar?`);
          session.step = 0;
        } else if (text === '4') {
          await send(`⏳ *Posição na Fila*\nNo momento você está na *3ª posição*.\nFaltam aproximadamente *45 minutos* para o seu atendimento.`);
          session.step = 0;
        } else if (text === '5') {
          await send(`🎁 *Fidelidade*\nVocê possui *150 Pontos* (Cliente Prata)!\nFalta pouco para ganhar um Corte Grátis! 🎉`);
          session.step = 0;
        } else if (text === '6') {
          await send(`👑 *Clube VIP BarberPro*\nAssine nosso clube e ganhe:\n- Cortes ilimitados no mês\n- 20% OFF em produtos\n- Bebida cortesia\nFale com nossos barbeiros para aderir!`);
          session.step = 0;
        } else if (text === '7') {
          await send(`⭐ *Avaliação*\nDe 1 a 5, que nota você dá para o seu último atendimento?`);
          session.step = 0;
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

// Rota para enviar mensagem
app.post('/send', async (req, res) => {
  try {
    const { number, message } = req.body;
    if (!number || !message) return res.status(400).json({ error: 'Número e mensagem são obrigatórios' });
    // Nota: Precisaria de referência ao sock - implementação futura
    res.json({ success: true, note: 'Mensagem enfileirada' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Rota para atualizar fila em tempo real
app.post('/fila/update', (req, res) => {
  io.emit('queue_updated', req.body);
  res.json({ success: true });
});

// Health check
app.get('/', (req, res) => res.json({ ok: true, service: 'BarberPro Bot' }));

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BarberPro Bot rodando na porta ${PORT}`);
  startBot().catch(console.error);
});
