import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      customersCount,
      appointmentsCount,
      activeSubscriptionsCount,
      financeRecords,
      financeTodayRecords,
      queueActive,
      queueCancelledToday,
      queueAbsentToday
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.appointment.count({ where: { date: { gte: today } } }),
      prisma.customerSubscription.count({ where: { status: "ACTIVE", validUntil: { gte: today } } }),
      prisma.finance.findMany({
        where: { date: { gte: sevenDaysAgo }, type: "INCOME" },
        orderBy: { date: 'asc' }
      }),
      prisma.finance.findMany({
        where: { date: { gte: today }, type: "INCOME" }
      }),
      prisma.queueManager.count({
        where: { status: { in: ["WAITING", "CONFIRMED", "COMMUTING", "NEXT", "IN_PROGRESS"] } }
      }),
      prisma.queueManager.count({
        where: { status: "CANCELLED", updatedAt: { gte: today } }
      }),
      prisma.queueManager.count({
        where: { status: "ABSENT", updatedAt: { gte: today } }
      })
    ]);

    // Calcular receita diária para o gráfico
    const revenueByDay: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      revenueByDay[d.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' })] = 0;
    }

    let totalRevenue7Days = 0;
    financeRecords.forEach(record => {
      const dStr = new Date(record.date).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' });
      if (revenueByDay[dStr] !== undefined) {
        revenueByDay[dStr] += record.amount;
      }
      totalRevenue7Days += record.amount;
    });

    const chartData = Object.keys(revenueByDay).map(date => ({
      date,
      revenue: revenueByDay[date]
    }));

    let totalRevenueToday = 0;
    financeTodayRecords.forEach(r => totalRevenueToday += r.amount);

    return NextResponse.json({
      totalCustomers: customersCount,
      todayAppointments: appointmentsCount,
      activeSubscriptions: activeSubscriptionsCount,
      totalRevenue7Days,
      totalRevenueToday,
      queueActive,
      queueCancelledToday,
      queueAbsentToday,
      avgWaitTime: 30, // Default for now
      fastestBarber: "Geral", // Placeholder
      chartData
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}
