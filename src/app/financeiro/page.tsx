export default function FinanceiroPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Financeiro</h1>
        <div className="flex gap-4">
          <button className="btn btn-secondary">Exportar Mês</button>
          <button className="btn btn-primary">+ Nova Movimentação</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>⬆️</div>
          <div className="stat-content">
            <h3>Entradas (Mês)</h3>
            <p className="text-success">R$ 15.450,00</p>
          </div>
        </div>
        
        <div className="stat-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>⬇️</div>
          <div className="stat-content">
            <h3>Saídas (Mês)</h3>
            <p className="text-danger">R$ 4.200,00</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Saldo Atual</h3>
            <p>R$ 11.250,00</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl mb-4 border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>Histórico Recente</h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem' }}>Data</th>
                <th style={{ padding: '1rem' }}>Descrição</th>
                <th style={{ padding: '1rem' }}>Tipo</th>
                <th style={{ padding: '1rem' }}>Barbeiro</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>19/05 - 15:30</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>Corte Degradê (Marcos)</td>
                <td style={{ padding: '1rem' }}><span className="badge badge-success">Entrada</span></td>
                <td style={{ padding: '1rem' }}>Pedro</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>+ R$ 45,00</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>19/05 - 14:00</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>Pagamento Fornecedor (Toalhas)</td>
                <td style={{ padding: '1rem' }}><span className="badge badge-danger">Saída</span></td>
                <td style={{ padding: '1rem' }}>-</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--danger)' }}>- R$ 150,00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
