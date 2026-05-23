import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const data = await request.json();

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price ? parseFloat(data.price) : undefined,
        durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes) : undefined,
        pointsEarned: data.pointsEarned ? parseInt(data.pointsEarned) : undefined,
        active: data.active
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Erro ao atualizar o serviço" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.service.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Erro ao deletar o serviço" }, { status: 500 });
  }
}
