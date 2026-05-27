import { prisma } from "@/lib/prisma";
import ClientesClient from "./ClientesClient";

export const revalidate = 0; 

export default async function ClientesPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <ClientesClient initialCustomers={customers} />;
}
