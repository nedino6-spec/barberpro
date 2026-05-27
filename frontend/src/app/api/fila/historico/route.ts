import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const barberId = request.nextUrl.searchParams.get("barberId");
    const today = new Date();

    const whereClause: any = {
      status: "COMPLETED",
      completedAt: {
        gte: startOfDay(today),
        lte: endOfDay(today)
      }
    };

    if (barberId) {
      whereClause.barberId = barberId;
    }

    const history = await prisma.queueManager.findMany({
      where: whereClause,
      include: { customer: true, barber: true, service: true },
      orderBy: { completedAt: 'desc' }
    });

    // Calcular TMA e stats
    let totalMins = 0;
    let validCount = 0;
    let totalRating = 0;
    let ratingCount = 0;

    const enriched = history.map(item => {
      let durationMins = 0;
      if (item.startedAt && item.completedAt) {
        durationMins = Math.round((item.completedAt.getTime() - item.startedAt.getTime()) / 60000);
        totalMins += durationMins;
        validCount++;
      }
      if (item.rating) {
        totalRating += item.rating;
        ratingCount++;
      }
      return { ...item, durationMins };
    });

    return NextResponse.json({
      items: enriched,
      stats: {
        total: history.length,
        averageMins: validCount > 0 ? Math.round(totalMins / validCount) : 0,
        averageRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : null,
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
