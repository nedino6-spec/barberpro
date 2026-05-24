import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Faturamento de Hoje (Apenas PAID e INCOME)
    const todayFinances = await prisma.finance.findMany({
      where: {
        date: { gte: today, lt: tomorrow },
        status: "PAID",
        type: "INCOME"
      },
    });
    const todayRevenue = todayFinances.reduce((acc, curr) => acc + curr.amount, 0);

    // 2. Agendamentos de Hoje
    const todayAppointmentsCount = await prisma.appointment.count({
      where: {
        date: { gte: today, lt: tomorrow },
      },
    });

    // 3. Novos Clientes Hoje
    const newCustomersCount = await prisma.customer.count({
      where: {
        createdAt: { gte: today, lt: tomorrow },
      },
    });

    // 4. Próximos Agendamentos (Hoje a partir de agora, ou os próximos de hoje)
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        date: { gte: today, lt: tomorrow },
      },
      orderBy: { startTime: 'asc' },
      take: 5,
      include: {
        customer: { select: { name: true } },
        service: { select: { name: true } },
        barber: { select: { name: true } },
      }
    });

    const formattedAppointments = upcomingAppointments.map(app => ({
      time: app.startTime,
      name: app.customer.name,
      service: app.service.name,
      barber: app.barber.name,
      status: app.status === "PENDING" ? "Aguardando" : "Confirmado",
      color: app.status === "PENDING" ? "text-warning bg-warning/10" : "text-success bg-success/10"
    }));

    // 5. Serviços Populares (Mocados por enquanto, no futuro buscar contagem do Appointment Group by Service)
    const popularServices = [
      { name: "Corte Degradê", percent: 45, val: "45%" },
      { name: "Corte + Barba", percent: 30, val: "30%" },
      { name: "Sobrancelha", percent: 15, val: "15%" },
    ];

    return NextResponse.json({
      todayRevenue,
      todayAppointmentsCount,
      newCustomersCount,
      upcomingAppointments: formattedAppointments,
      popularServices
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
