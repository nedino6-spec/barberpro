import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validations
    if (!data.name || !data.price || !data.durationMinutes) {
      return NextResponse.json({ error: "Nome, preço e duração são obrigatórios" }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        durationMinutes: parseInt(data.durationMinutes),
        pointsEarned: parseInt(data.pointsEarned || "0"),
        active: data.active !== undefined ? data.active : true
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
