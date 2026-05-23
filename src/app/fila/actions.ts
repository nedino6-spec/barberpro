"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addToQueue(formData: FormData) {
  let customerId = formData.get("customerId") as string;
  
  // Se não existir, pega o primeiro cliente só para testar
  if (!customerId) {
      const firstCustomer = await prisma.customer.findFirst();
      if (firstCustomer) customerId = firstCustomer.id;
      else throw new Error("Crie um cliente primeiro na aba Clientes.");
  }

  // Calcula tempo de espera (ex: 15 min por pessoa na frente)
  const peopleAhead = await prisma.queueManager.count({ where: { status: "WAITING" } });
  
  const newItem = await prisma.queueManager.create({
    data: {
      customerId,
      position: peopleAhead + 1,
      estimatedWaitMins: (peopleAhead + 1) * 15,
      status: "WAITING"
    }
  });

  // Notificar via WebSocket
  try {
    const apiUrl = process.env.WHATSAPP_API_URL || "http://localhost:3001";
    await fetch(`${apiUrl}/fila/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem)
    });
  } catch (e) {
    console.log("WebSocket server indisponível");
  }

  revalidatePath("/fila");
}

export async function completeQueueItem(id: string) {
  // 1. Marca como concluído
  await prisma.queueManager.update({
    where: { id },
    data: { status: "COMPLETED" }
  });

  // 2. Busca a fila atualizada (em ordem de chegada)
  const activeQueue = await prisma.queueManager.findMany({
    where: { status: "WAITING" },
    orderBy: { createdAt: 'asc' },
    include: { customer: true }
  });

  // 3. Se a fila tem 3 ou mais pessoas, o 3º acabou de assumir essa posição
  if (activeQueue.length >= 3) {
    const thirdPerson = activeQueue[2]; // index 2 = 3ª posição
    
    // 4. Envia o alerta via Robô WhatsApp
    try {
      const botApiUrl = "https://barberpro-whatsapp-bot.onrender.com";
      await fetch(`${botApiUrl}/api/send-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: thirdPerson.customer.phone,
          message: `⏳ *Fila Virtual - BarberPro*\nPrepare-se, *${thirdPerson.customer.name}*!\nVocê acabou de assumir o *3º lugar da fila*. Por favor, dirija-se à barbearia para não perder o seu lugar! ✂️`
        })
      });
      console.log(`[Bot] Alerta enviado para o 3º da fila: ${thirdPerson.customer.name}`);
    } catch (e) {
      console.log("Erro ao enviar alerta WhatsApp:", e);
    }
  }

  // Notificar painel via WebSocket (opcional/futuro)
  try {
    const apiUrl = process.env.WHATSAPP_API_URL || "https://barberpro-whatsapp-bot.onrender.com";
    await fetch(`${apiUrl}/fila/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "completed", id })
    });
  } catch (e) {}

  revalidatePath("/fila");
}
