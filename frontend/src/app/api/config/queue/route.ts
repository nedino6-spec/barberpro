import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
    }
    
    // Conta pessoas na fila agora
    const currentQueueSize = await prisma.queueManager.count({
      where: { status: { in: ["WAITING", "CONFIRMED", "IN_TRANSIT", "NEXT", "IN_PROGRESS"] } }
    });

    return NextResponse.json({
      queueOpenTime: tenant.queueOpenTime,
      queueCloseTime: tenant.queueCloseTime,
      isQueuePaused: tenant.isQueuePaused,
      queueMaxSize: tenant.queueMaxSize,
      currentQueueSize,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { queueOpenTime, queueCloseTime, isQueuePaused, queueMaxSize } = body;

    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
    }

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        ...(queueOpenTime !== undefined && { queueOpenTime }),
        ...(queueCloseTime !== undefined && { queueCloseTime }),
        ...(isQueuePaused !== undefined && { isQueuePaused }),
        ...(queueMaxSize !== undefined && { queueMaxSize: parseInt(queueMaxSize) }),
      }
    });

    return NextResponse.json({
      queueOpenTime: updated.queueOpenTime,
      queueCloseTime: updated.queueCloseTime,
      isQueuePaused: updated.isQueuePaused,
      queueMaxSize: updated.queueMaxSize,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
