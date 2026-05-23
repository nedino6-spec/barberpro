import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    });
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar planos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
      }
    });
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar plano" }, { status: 500 });
  }
}
