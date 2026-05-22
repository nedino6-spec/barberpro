const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const stateFile = path.join(__dirname, '..', 'whatsapp-state.json');

function updateState(newState) {
  let state = { status: 'DISCONNECTED', qr: null };
  try {
    if (fs.existsSync(stateFile)) {
      state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    }
  } catch (e) {}
  
  state = { ...state, ...newState };
  fs.writeFileSync(stateFile, JSON.stringify(state));
  console.log(`[WhatsApp] Status atualizado: ${state.status}`);
}

updateState({ status: 'STARTING', qr: null });

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(__dirname, 'session') }),
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

client.on('qr', (qr) => updateState({ status: 'AWAITING_QR', qr: qr }));
client.on('ready', () => {
    updateState({ status: 'CONNECTED', qr: null });
    console.log('Cliente WhatsApp está pronto!');
});
client.on('authenticated', () => updateState({ status: 'AUTHENTICATED', qr: null }));
client.on('auth_failure', () => updateState({ status: 'AUTH_FAILURE', qr: null }));
client.on('disconnected', () => updateState({ status: 'DISCONNECTED', qr: null }));

// ---------------------------------------------------------
// CHATBOT INTELIGENTE - AUTO RESPOSTA
// ---------------------------------------------------------
const userSessions = {};

client.on('message', async (msg) => {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const phone = contact.number;
    const text = msg.body.toLowerCase();

    // Ignora mensagens de grupos
    if (chat.isGroup) return;

    if (!userSessions[phone]) {
        userSessions[phone] = { step: 0 };
    }

    const session = userSessions[phone];

    if (text === 'oi' || text === 'olá' || text === 'ola' || text === 'menu') {
        session.step = 1;
        await client.sendMessage(msg.from, `Olá, ${contact.name || 'amigo(a)'}! Bem-vindo(a) à *BarberPro* ✂️\n\nComo posso te ajudar hoje?\n\n*1.* 📅 Agendar Horário\n*2.* 🎁 Ver Meus Pontos (Fidelidade)\n*3.* 🚶‍♂️ Entrar na Fila Virtual (Agora)\n*4.* 👨‍💼 Falar com Atendente`);
        return;
    }

    if (session.step === 1) {
        if (text === '1') {
            await client.sendMessage(msg.from, '🗓️ *Agendamento*\nPara agendar um horário, por favor acesse nosso link rápido:\n👉 https://barberpro.com.br/agendar');
            session.step = 0;
        } else if (text === '2') {
            await client.sendMessage(msg.from, '🎁 *Fidelidade*\nBuscando seus pontos... 🔄\nVocê possui *150 Pontos* (Cliente Prata)!\nFalta pouco para você ganhar um Corte Grátis.');
            session.step = 0;
        } else if (text === '3') {
            await client.sendMessage(msg.from, '🚶‍♂️ *Fila Virtual*\nVocê entrou na nossa Fila Virtual! ✅\n\nSua posição atual é: *3º*\nTempo estimado: *45 minutos*.\n\nNós te avisaremos 10 minutinhos antes da sua vez!');
            session.step = 0;
        } else if (text === '4') {
            await client.sendMessage(msg.from, '👨‍💼 Um de nossos atendentes já vai falar com você. Aguarde um instante!');
            session.step = 0;
        } else {
            await client.sendMessage(msg.from, 'Desculpe, não entendi. Digite *Menu* para ver as opções novamente.');
        }
    }
});

client.initialize();

// API para o Next.js pedir para enviar mensagens
app.post('/send', async (req, res) => {
    try {
        const { number, message } = req.body;
        if (!number || !message) return res.status(400).json({ error: 'Número e mensagem são obrigatórios' });
        
        // Format number to WhatsApp format (ex: 5511999999999@c.us)
        const formattedNumber = `${number.replace(/\D/g, '')}@c.us`;
        
        await client.sendMessage(formattedNumber, message);
        console.log(`Mensagem enviada para ${formattedNumber}`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao enviar mensagem', error);
        res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
});

app.get('/status', (req, res) => {
    try {
        if (fs.existsSync(stateFile)) {
            const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
            return res.json(state);
        }
        res.json({ status: 'OFFLINE', qr: null });
    } catch (e) {
        res.json({ status: 'ERROR', qr: null });
    }
});

// Importações do Socket.io
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' } // Em produção, colocar a URL exata do Next.js
});

io.on('connection', (socket) => {
    console.log('[WebSocket] Novo cliente conectado (Painel Admin)');
    
    socket.on('disconnect', () => {
        console.log('[WebSocket] Cliente desconectado');
    });
});

// Nova rota para o Next.js disparar atualizações de fila
app.post('/fila/update', (req, res) => {
    // Quando o Prisma atualizar a fila, o Next.js chama aqui e o Socket.io avisa o painel!
    io.emit('queue_updated', req.body);
    res.json({ success: true });
});

server.listen(3001, () => {
    console.log('API do WhatsApp e WebSocket rodando na porta 3001');
});
