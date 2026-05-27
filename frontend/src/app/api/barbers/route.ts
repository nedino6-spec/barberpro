import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const barbers = await prisma.user.findMany({
      where: { role: { in: ["BARBER", "ADMIN"] } },
      select: { id: true, name: true, specialty: true }
    });
    return NextResponse.json(barbers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
