import { prisma } from "@/lib/prisma";
import FilaClient from "./FilaClient";

export const revalidate = 0;

export default async function FilaPage() {
  const queue = await prisma.queueManager.findMany({
    where: { 
      status: { notIn: ["COMPLETED", "CANCELLED", "ABSENT"] }
    },
    include: { customer: true, barber: true },
    orderBy: { position: 'asc' }
  });

  const barbers = await prisma.user.findMany({
    where: { role: "BARBER" }
  });

  // Também precisamos buscar o tenant para ver as configurações da fila
  const tenant = await prisma.tenant.findFirst();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Monitor da Fila (Live)</h1>
      </div>

      <FilaClient 
        initialQueue={queue} 
        barbers={barbers}
        queueConfig={{
          isQueuePaused: tenant?.isQueuePaused || false,
          queueOpenTime: tenant?.queueOpenTime || "09:00",
          queueCloseTime: tenant?.queueCloseTime || "18:00"
        }}
      />
    </div>
  );
}
