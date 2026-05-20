import CustomerModal from "@/components/CustomerModal";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Disable cache for dynamic data

export default async function ClientesPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Clientes</h1>
        <CustomerModal />
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div className="input-group" style={{ marginBottom: 0, flex: 1, maxWidth: '300px' }}>
            <input type="text" className="input" placeholder="Buscar cliente por nome ou celular..." />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary">Exportar</button>
            <button className="btn btn-secondary">Filtros</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem' }}>Nome</th>
                <th style={{ padding: '1rem' }}>Celular (WhatsApp)</th>
                <th style={{ padding: '1rem' }}>Total Visitas</th>
                <th style={{ padding: '1rem' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Nenhum cliente cadastrado ainda.
                  </td>
                </tr>
              )}
              {customers.map((customer) => (
                <tr key={customer.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{customer.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{customer.phone}</td>
                  <td style={{ padding: '1rem' }}><span className="badge badge-success">{customer.totalVisits} visitas</span></td>
                  <td style={{ padding: '1rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Ver Perfil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
