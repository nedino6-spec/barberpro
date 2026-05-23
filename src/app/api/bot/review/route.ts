import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { phone, rating } = await request.json();

    if (!phone || !rating) {
      return NextResponse.json({ error: "Telefone e nota são obrigatórios" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { phone } });
    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    await prisma.review.create({
      data: {
        rating: parseInt(rating),
        customerId: customer.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving review:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
