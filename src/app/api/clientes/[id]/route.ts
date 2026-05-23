import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 5
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar cliente" }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const data = await request.json();
    
    const updated = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
        notes: data.notes !== undefined ? data.notes : undefined,
        isBlocked: data.isBlocked !== undefined ? data.isBlocked : undefined,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 });
  }
}
