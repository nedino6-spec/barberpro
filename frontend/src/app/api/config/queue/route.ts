import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      queueOpenTime: tenant.queueOpenTime,
      queueCloseTime: tenant.queueCloseTime,
      isQueuePaused: tenant.isQueuePaused
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { queueOpenTime, queueCloseTime, isQueuePaused } = body;

    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
    }

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        ...(queueOpenTime !== undefined && { queueOpenTime }),
        ...(queueCloseTime !== undefined && { queueCloseTime }),
        ...(isQueuePaused !== undefined && { isQueuePaused })
      }
    });

    return NextResponse.json({
      queueOpenTime: updated.queueOpenTime,
      queueCloseTime: updated.queueCloseTime,
      isQueuePaused: updated.isQueuePaused
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
