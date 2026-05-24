import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const barbers = await prisma.user.findMany({
      where: { role: "BARBER" },
      include: {
        googleIntegration: true,
      },
    });
    
    return NextResponse.json(barbers);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar barbeiros" }, { status: 500 });
  }
}
