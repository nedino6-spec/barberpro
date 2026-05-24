import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "E-mail já está em uso" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "BARBER",
      }
    });

    const secret = process.env.JWT_SECRET || "default_super_secret_dev";
    
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      secret,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      token,
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
