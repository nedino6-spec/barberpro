import Link from "next/link";
import CustomerModal from "@/components/CustomerModal";
import { prisma } from "@/lib/prisma";
import { Users, Search, Download, Filter, Phone, Star, ChevronRight, Ban } from "lucide-react";

export const revalidate = 0; 

export default async function ClientesPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Clientes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie sua base de clientes.</p>
        </div>
        <div className="w-full md:w-auto">
          <CustomerModal />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              className="w-full bg-background border border-border text-foreground rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-colors" 
              placeholder="Buscar por nome ou celular..." 
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-medium hover:bg-bg-tertiary transition-colors active:scale-95">
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Exportar</span>
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-medium hover:bg-bg-tertiary transition-colors active:scale-95">
              <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>
        </div>

        {/* Lista de Clientes - Responsiva (Cards em Mobile, Tabela em Desktop) */}
        {customers.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground bg-background rounded-xl border border-dashed border-border flex flex-col items-center justify-center">
            <Users className="w-12 h-12 mb-3 opacity-20" />
            <p>Nenhum cliente cadastrado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {customers.map((customer) => (
              <Link href={`/clientes/${customer.id}`} key={customer.id} className={`bg-background border rounded-xl p-5 hover:border-primary/50 transition-colors group cursor-pointer block ${customer.isBlocked ? 'border-danger/30 bg-danger/5' : 'border-border'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-success bg-success/10">
                      <Star className="w-3 h-3 fill-current" /> {customer.totalVisits} visitas
                    </span>
                    {customer.isBlocked && (
                      <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-danger bg-danger/10">
                        <Ban className="w-3 h-3" /> Bloqueado
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className={`font-bold text-lg truncate ${customer.isBlocked ? 'text-danger' : 'text-foreground'}`}>{customer.name}</h3>
                
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2 font-medium">
                  <Phone className="w-4 h-4" /> {customer.phone}
                </div>
                
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm text-primary font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                  Ver Perfil <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
