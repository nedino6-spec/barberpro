import { prisma } from "@/lib/prisma";
import AgendaGridClient from "./AgendaGridClient";

export const revalidate = 0;

export default async function AgendaPage() {
  const customers = await prisma.customer.findMany();
  const barbers = await prisma.user.findMany({ where: { role: 'BARBER' } });
  const services = await prisma.service.findMany({ where: { active: true } });

  return (
    <div className="max-w-6xl mx-auto">
      <AgendaGridClient 
        barbers={barbers} 
        customers={customers} 
        services={services} 
      />
    </div>
  );
}
