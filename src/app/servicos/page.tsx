import { prisma } from "@/lib/prisma";
import ServicesClient from "./ServicesClient";
import ServiceModal from "@/components/ServiceModal";

export const revalidate = 0;

export default async function ServicosPage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Serviços</h1>
        <ServiceModal />
      </div>

      <ServicesClient services={services} />
    </div>
  );
}
