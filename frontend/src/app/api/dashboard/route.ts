import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, format, startOfMonth, endOfMonth } from "date-fns";

export async function GET() {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // ── 1. Fila Ativa ──────────────────────────────────────────
    const filaAtiva = await prisma.queueManager.count({
      where: { status: { in: ["WAITING", "CONFIRMED", "IN_TRANSIT", "NEXT", "IN_PROGRESS"] } }
    });

    // ── 2. Faturamento Diário ──────────────────────────────────
    const financesToday = await prisma.finance.aggregate({
      where: { date: { gte: start, lte: end }, status: "PAID", type: "INCOME" },
      _sum: { amount: true }
    });
    const revenueToday = financesToday._sum.amount || 0;

    // ── 3. Atendimentos do Dia ─────────────────────────────────
    const completedToday = await prisma.queueManager.findMany({
      where: { status: "COMPLETED", completedAt: { gte: start, lte: end } },
      include: { barber: true }
    });

    // ── 4. TMA e ranking de barbeiros ─────────────────────────
    let totalMins = 0;
    let validTmaCount = 0;
    let totalRating = 0;
    let ratingCount = 0;
    const barberStats: Record<string, { time: number; count: number; name: string; rating: number; ratingCount: number }> = {};

    completedToday.forEach(item => {
      if (item.startedAt && item.completedAt) {
        const mins = Math.floor((item.completedAt.getTime() - item.startedAt.getTime()) / 60000);
        totalMins += mins;
        validTmaCount++;
        if (item.barberId && item.barber) {
          if (!barberStats[item.barberId]) {
            barberStats[item.barberId] = { time: 0, count: 0, name: item.barber.name, rating: 0, ratingCount: 0 };
          }
          barberStats[item.barberId].time += mins;
          barberStats[item.barberId].count++;
        }
      }
      if (item.rating) {
        totalRating += item.rating;
        ratingCount++;
        if (item.barberId) {
          barberStats[item.barberId].rating += item.rating;
          barberStats[item.barberId].ratingCount++;
        }
      }
    });

    const averageServiceTime = validTmaCount > 0 ? Math.round(totalMins / validTmaCount) : 0;
    const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : null;

    // Ranking de barbeiros
    const barberRanking = Object.values(barberStats)
      .map(s => ({
        name: s.name,
        atendimentos: s.count,
        tma: s.count > 0 ? Math.round(s.time / s.count) : 0,
        rating: s.ratingCount > 0 ? parseFloat((s.rating / s.ratingCount).toFixed(1)) : null,
      }))
      .sort((a, b) => b.atendimentos - a.atendimentos);

    // Barbeiro mais rápido
    let fastestBarber = "N/A";
    let fastestTma = 9999;
    Object.values(barberStats).forEach(s => {
      const tma = s.count > 0 ? s.time / s.count : 9999;
      if (tma < fastestTma && s.count > 0) { fastestTma = tma; fastestBarber = `${s.name} (${Math.round(tma)}m)`; }
    });

    // ── 5. Gráfico Atendimentos por hora (dados reais) ─────────
    const hours = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
    const hourlyData = hours.map(h => ({ hour: `${h}:00`, atendimentos: 0, faturamento: 0 }));

    completedToday.forEach(item => {
      if (item.completedAt) {
        const h = item.completedAt.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit' });
        const idx = hourlyData.findIndex(d => d.hour.startsWith(h));
        if (idx >= 0) hourlyData[idx].atendimentos++;
      }
    });

    // ── 6. Faturamento últimos 7 dias ─────────────────────────
    const last7Days = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = subDays(today, 6 - i);
        return prisma.finance.aggregate({
          where: { date: { gte: startOfDay(date), lte: endOfDay(date) }, status: "PAID", type: "INCOME" },
          _sum: { amount: true }
        }).then(r => ({
          day: format(date, 'dd/MM'),
          faturamento: r._sum.amount || 0,
        }));
      })
    );

    // ── 7. Faturamento vs Despesas (mês atual) ─────────────────
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const [receitas, despesas] = await Promise.all([
      prisma.finance.aggregate({ where: { date: { gte: monthStart, lte: monthEnd }, type: "INCOME", status: "PAID" }, _sum: { amount: true } }),
      prisma.finance.aggregate({ where: { date: { gte: monthStart, lte: monthEnd }, type: "EXPENSE" }, _sum: { amount: true } }),
    ]);

    // ── 8. Total clientes ──────────────────────────────────────
    const [totalClientes, clientesNovosHoje] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { createdAt: { gte: start, lte: end } } })
    ]);

    return NextResponse.json({
      filaAtiva,
      revenueToday,
      totalAtendimentos: completedToday.length,
      averageServiceTime,
      averageRating,
      fastestBarber,
      totalClientes,
      clientesNovosHoje,
      receitasMes: receitas._sum.amount || 0,
      despesasMes: despesas._sum.amount || 0,
      hourlyData,
      last7Days,
      barberRanking,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
