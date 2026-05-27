import { prisma } from "@/lib/prisma";

export async function calculateEstimatedWaitTime(barberId?: string): Promise<number> {
  // Configuração padrão
  const DEFAULT_SERVICE_TIME = 30; // 30 minutos

  try {
    // 1. Quantas pessoas estão aguardando
    const whereClause: any = {
      status: { in: ["WAITING", "CONFIRMED", "NEXT", "IN_PROGRESS", "IN_TRANSIT"] }
    };
    
    if (barberId) {
      whereClause.barberId = barberId;
    }

    const peopleInQueue = await prisma.queueManager.findMany({
      where: whereClause,
      select: {
        status: true,
        barberId: true,
      }
    });

    if (peopleInQueue.length === 0) {
      return 0; // Fila vazia = atendimento imediato
    }

    // 2. Tentar calcular o TMA (Tempo Médio de Atendimento) histórico se for um barbeiro específico
    let averageTma = DEFAULT_SERVICE_TIME;
    
    if (barberId) {
      const historicalItems = await prisma.queueManager.findMany({
        where: {
          barberId,
          status: "COMPLETED",
          startedAt: { not: null },
          completedAt: { not: null },
        },
        orderBy: { completedAt: 'desc' },
        take: 10 // Pega os últimos 10 atendimentos
      });

      if (historicalItems.length > 0) {
        let totalMins = 0;
        let validCount = 0;

        for (const item of historicalItems) {
          if (item.startedAt && item.completedAt) {
            const diffMs = item.completedAt.getTime() - item.startedAt.getTime();
            const diffMins = Math.round(diffMs / 60000);
            
            // Ignora anomalias (muito rápido < 5m ou muito longo > 180m)
            if (diffMins >= 5 && diffMins <= 180) {
              totalMins += diffMins;
              validCount++;
            }
          }
        }
        
        if (validCount > 0) {
          averageTma = Math.round(totalMins / validCount);
        }
      }
    }

    // 3. Cálculo Preditivo simples (Pessoas * TMA)
    // Se há alguém "IN_PROGRESS", o tempo restante seria TMA/2 (aproximação simples)
    let totalEstimatedWait = 0;

    for (const person of peopleInQueue) {
      if (person.status === "IN_PROGRESS") {
        totalEstimatedWait += Math.round(averageTma / 2);
      } else {
        totalEstimatedWait += averageTma;
      }
    }

    return totalEstimatedWait;
  } catch (err) {
    console.error("Erro na predição de tempo da fila:", err);
    return DEFAULT_SERVICE_TIME;
  }
}
