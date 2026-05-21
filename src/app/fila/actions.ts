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
  await prisma.queueManager.update({
    where: { id },
    data: { status: "COMPLETED" }
  });

  // Recalcular posições
  // ...

  try {
    const apiUrl = process.env.WHATSAPP_API_URL || "http://localhost:3001";
    await fetch(`${apiUrl}/fila/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "completed", id })
    });
  } catch (e) {}

  revalidatePath("/fila");
}
