import { prisma } from "@/lib/prisma";
import FilaClient from "./FilaClient";

export const revalidate = 0;

export default async function FilaPage() {
  const queue = await prisma.queueManager.findMany({
    where: { status: "WAITING" },
    include: { customer: true },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Monitor da Fila (Live)</h1>
      </div>

      <FilaClient initialQueue={queue} />
    </div>
  );
}
