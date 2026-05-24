import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get current open register
export async function GET() {
  try {
    const register = await prisma.cashRegister.findFirst({
      where: { status: "OPEN" },
      orderBy: { openedAt: "desc" },
    });
    
    return NextResponse.json({ register });
  } catch (error) {
    console.error("Error fetching register:", error);
    return NextResponse.json({ error: "Failed to fetch register" }, { status: 500 });
  }
}

// Open or close register
export async function POST(req: Request) {
  try {
    const { action, initialBalance, finalBalance, userId } = await req.json();

    if (action === "OPEN") {
      // Check if there is already an open register
      const existing = await prisma.cashRegister.findFirst({
        where: { status: "OPEN" },
      });

      if (existing) {
        return NextResponse.json({ error: "Já existe um caixa aberto." }, { status: 400 });
      }

      // We need a userId (currently hardcoded for MVP, or get from session if NextAuth is used)
      // Let's find an ADMIN user if userId is not provided
      let openedById = userId;
      if (!openedById) {
        const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
        if (!admin) {
           return NextResponse.json({ error: "Nenhum usuário administrador encontrado." }, { status: 400 });
        }
        openedById = admin.id;
      }

      const newRegister = await prisma.cashRegister.create({
        data: {
          status: "OPEN",
          initialBalance: Number(initialBalance) || 0,
          openedById,
        },
      });

      return NextResponse.json({ success: true, register: newRegister });
    }

    if (action === "CLOSE") {
      const openRegister = await prisma.cashRegister.findFirst({
        where: { status: "OPEN" },
        orderBy: { openedAt: "desc" },
      });

      if (!openRegister) {
        return NextResponse.json({ error: "Não há caixa aberto para fechar." }, { status: 400 });
      }

      const closedRegister = await prisma.cashRegister.update({
        where: { id: openRegister.id },
        data: {
          status: "CLOSED",
          closedAt: new Date(),
          finalBalance: Number(finalBalance) || 0,
        },
      });

      return NextResponse.json({ success: true, register: closedRegister });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error handling register:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
