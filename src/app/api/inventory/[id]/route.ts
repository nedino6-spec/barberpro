import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();

    const product = await prisma.inventory.update({
      where: { id: params.id },
      data: {
        productName: data.productName,
        quantity: data.quantity !== undefined ? parseInt(data.quantity) : undefined,
        minQuantity: data.minQuantity !== undefined ? parseInt(data.minQuantity) : undefined,
        price: data.price !== undefined ? parseFloat(data.price) : undefined
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.inventory.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
  }
}
