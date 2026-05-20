export default function Dashboard() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="flex gap-4">
          <button className="btn btn-secondary">Filtrar: Hoje</button>
          <button className="btn btn-primary">+ Novo Agendamento</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Agendamentos Hoje</h3>
            <p>24</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Faturamento Diário</h3>
            <p>R$ 1.250,00</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Novos Clientes (Mês)</h3>
            <p>15</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl mb-4 border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>Próximos Agendamentos</h2>
          
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex justify-between items-center p-3" style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex gap-3 items-center">
                <div style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>14:00</div>
                <div>
                  <div style={{ fontWeight: 500 }}>Carlos Silva</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Corte + Barba (Barbeiro: João)</div>
                </div>
              </div>
              <span className="badge badge-warning">Aguardando</span>
            </div>

            <div className="flex justify-between items-center p-3" style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex gap-3 items-center">
                <div style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>15:00</div>
                <div>
                  <div style={{ fontWeight: 500 }}>Marcos Pereira</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Corte Degradê (Barbeiro: Pedro)</div>
                </div>
              </div>
              <span className="badge badge-success">Confirmado</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl mb-4 border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>Serviços Populares</h2>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex justify-between items-center">
              <span>Corte Degradê</span>
              <span className="text-secondary">45% das vendas</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Corte + Barba</span>
              <span className="text-secondary">30% das vendas</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Sobrancelha</span>
              <span className="text-secondary">15% das vendas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
