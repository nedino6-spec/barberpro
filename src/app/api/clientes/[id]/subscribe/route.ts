import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { planId, months = 1 } = await request.json();
    
    if (!planId) return NextResponse.json({ error: "planId is required" }, { status: 400 });

    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + months);

    const subscription = await prisma.customerSubscription.upsert({
      where: { customerId: params.id },
      update: {
        planId,
        validUntil,
        status: "ACTIVE"
      },
      create: {
        customerId: params.id,
        planId,
        validUntil,
        status: "ACTIVE"
      }
    });

    return NextResponse.json(subscription);
  } catch (error: any) {
    console.error("Erro ao assinar plano:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
