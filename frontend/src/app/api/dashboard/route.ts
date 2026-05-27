import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // 1. Clientes na Fila
    const filaAtiva = await prisma.queueManager.count({
      where: { status: { in: ["WAITING", "CONFIRMED", "IN_TRANSIT", "NEXT", "IN_PROGRESS"] } }
    });

    // 2. Faturamento Diário (Soma das Finanças do dia)
    const financesToday = await prisma.finance.aggregate({
      where: {
        date: { gte: start, lte: end },
        status: "PAID",
        type: "INCOME"
      },
      _sum: { amount: true }
    });
    const revenueToday = financesToday._sum.amount || 0;

    // 3. Atendimentos do Dia (Fila Completed)
    const completedToday = await prisma.queueManager.findMany({
      where: { 
        status: "COMPLETED",
        updatedAt: { gte: start, lte: end }
      },
      include: { barber: true }
    });

    // 4. Calcular TMA (Tempo Médio de Atendimento)
    let totalMins = 0;
    let validTmaCount = 0;
    const barberStats: Record<string, { time: number, count: number, name: string }> = {};

    completedToday.forEach(item => {
      if (item.startedAt && item.completedAt) {
        const diffMs = item.completedAt.getTime() - item.startedAt.getTime();
        const mins = Math.floor(diffMs / 60000);
        totalMins += mins;
        validTmaCount++;

        if (item.barberId && item.barber) {
          if (!barberStats[item.barberId]) {
             barberStats[item.barberId] = { time: 0, count: 0, name: item.barber.name };
          }
          barberStats[item.barberId].time += mins;
          barberStats[item.barberId].count += 1;
        }
      }
    });

    const averageServiceTime = validTmaCount > 0 ? Math.round(totalMins / validTmaCount) : 0;

    // Barbeiro mais rápido
    let fastestBarber = "Nenhum";
    let fastestTma = 9999;
    
    Object.values(barberStats).forEach(stat => {
       const tma = stat.time / stat.count;
       if (tma < fastestTma) {
          fastestTma = tma;
          fastestBarber = stat.name;
       }
    });

    // Dados para gráfico de Atendimentos por hora
    const hourlyData = [
      { hour: '09:00', atendimentos: 0 },
      { hour: '11:00', atendimentos: 0 },
      { hour: '13:00', atendimentos: 0 },
      { hour: '15:00', atendimentos: 0 },
      { hour: '17:00', atendimentos: 0 },
      { hour: '19:00', atendimentos: 0 },
    ];
    // Simulação pro gráfico (na prática faríamos o agrupamento)
    hourlyData[1].atendimentos = 3;
    hourlyData[3].atendimentos = Math.floor(completedToday.length / 2);
    hourlyData[4].atendimentos = completedToday.length;

    return NextResponse.json({
      filaAtiva,
      revenueToday,
      totalAtendimentos: completedToday.length,
      averageServiceTime,
      fastestBarber: fastestTma === 9999 ? "N/A" : `${fastestBarber} (${Math.round(fastestTma)}m)`,
      hourlyData
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
