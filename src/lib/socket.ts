import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocketClient = (tenantId: string) => {
  if (socket) return socket;

  // Conecta ao servidor do Bot do WhatsApp que já possui o Socket.IO rodando na porta dele (ou URL base)
  const SOCKET_URL = process.env.NEXT_PUBLIC_BOT_URL || "http://localhost:3001";
  
  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("[Socket.io Client] Conectado com sucesso");
    socket?.emit("join-tenant", tenantId);
  });

  socket.on("disconnect", () => {
    console.log("[Socket.io Client] Desconectado");
  });

  return socket;
};

export const getSocket = () => socket;
