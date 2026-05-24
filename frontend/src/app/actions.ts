"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  if (!name || !phone) {
    throw new Error("Nome e telefone são obrigatórios");
  }

  await prisma.customer.create({
    data: { name, phone },
  });

  revalidatePath("/clientes");
  revalidatePath("/agenda");
}

export async function createAppointment(formData: FormData) {
  const customerId = formData.get("customerId") as string;
  const barberId = formData.get("barberId") as string;
  const serviceId = formData.get("serviceId") as string;
  const dateStr = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  if (!customerId || !barberId || !serviceId || !dateStr || !startTime || !endTime) {
    throw new Error("Todos os campos do agendamento são obrigatórios");
  }

  // A validação completa e o webhook ficam melhor via API, 
  // mas como isso é uma Server Action simples, vamos chamar a API interna ou recriar a lógica aqui.
  
  // Como a API já está pronta com envio de WhatsApp, vamos fazer um POST para ela.
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  
  const res = await fetch(`${baseUrl}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerId,
      barberId,
      serviceId,
      date: dateStr,
      startTime,
      endTime
    })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Erro ao criar agendamento");
  }

  revalidatePath("/agenda");
  revalidatePath("/");
}

// ------------------------------------
// ACTIONS DE SERVIÇOS
// ------------------------------------

export async function saveService(formData: FormData) {
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const durationMinutes = Number(formData.get("durationMinutes"));
  const price = Number(formData.get("price"));
  const pointsEarned = Number(formData.get("pointsEarned") || 0);

  if (!name || !price || !durationMinutes) {
    throw new Error("Nome, preço e duração são obrigatórios");
  }

  if (id) {
    // Edição
    await prisma.service.update({
      where: { id },
      data: { name, description, durationMinutes, price, pointsEarned }
    });
  } else {
    // Criação
    await prisma.service.create({
      data: { name, description, durationMinutes, price, pointsEarned }
    });
  }

  revalidatePath("/servicos");
  revalidatePath("/agenda");
}

export async function toggleServiceStatus(id: string, active: boolean) {
  await prisma.service.update({
    where: { id },
    data: { active }
  });
  revalidatePath("/servicos");
}

