import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      // Create a default tenant if it doesn't exist
      tenant = await prisma.tenant.create({
        data: {
          name: "Barbearia Principal",
          queueOpenTime: "09:00",
          queueCloseTime: "18:00",
          isQueuePaused: false
        }
      });
    }

    return NextResponse.json({
      queueOpenTime: tenant.queueOpenTime,
      queueCloseTime: tenant.queueCloseTime,
      isQueuePaused: tenant.isQueuePaused
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar config" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    let tenant = await prisma.tenant.findFirst();
    
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: { name: "Barbearia Principal" }
      });
    }

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        queueOpenTime: data.queueOpenTime !== undefined ? data.queueOpenTime : tenant.queueOpenTime,
        queueCloseTime: data.queueCloseTime !== undefined ? data.queueCloseTime : tenant.queueCloseTime,
        isQueuePaused: data.isQueuePaused !== undefined ? data.isQueuePaused : tenant.isQueuePaused,
      }
    });

    return NextResponse.json({
      queueOpenTime: updated.queueOpenTime,
      queueCloseTime: updated.queueCloseTime,
      isQueuePaused: updated.isQueuePaused
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar config" }, { status: 500 });
  }
}
