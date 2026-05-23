import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.inventory.findMany({
      orderBy: { productName: 'asc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.productName || data.quantity === undefined || data.minQuantity === undefined || data.price === undefined) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const product = await prisma.inventory.create({
      data: {
        productName: data.productName,
        quantity: parseInt(data.quantity),
        minQuantity: parseInt(data.minQuantity),
        price: parseFloat(data.price)
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
