"use client";

import { X, Check } from "lucide-react";
import { useEffect, useState } from "react";

export type DashboardConfig = {
  showFinance: boolean;
  showAppointmentsCount: boolean;
  showNewCustomers: boolean;
  showUpcomingAppointments: boolean;
  showPopularServices: boolean;
};

const DEFAULT_CONFIG: DashboardConfig = {
  showFinance: true,
  showAppointmentsCount: true,
  showNewCustomers: true,
  showUpcomingAppointments: true,
  showPopularServices: true,
};

export function ConfiguracaoDashboardModal({ 
  isOpen, 
  onClose,
  config,
  onSave
}: { 
  isOpen: boolean, 
  onClose: () => void,
  config: DashboardConfig,
  onSave: (newConfig: DashboardConfig) => void
}) {
  const [localConfig, setLocalConfig] = useState<DashboardConfig>(config);

  // Sync when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof DashboardConfig) => {
    setLocalConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-bold">Personalizar Dashboard</h2>
          <button onClick={onClose} className="p-1 hover:bg-bg-tertiary rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground mb-4">Escolha quais informações deseja exibir no seu painel principal.</p>

          <div className="flex flex-col gap-3">
            {[
              { key: "showFinance", label: "Faturamento do Dia" },
              { key: "showAppointmentsCount", label: "Qtd. Agendamentos" },
              { key: "showNewCustomers", label: "Novos Clientes" },
              { key: "showUpcomingAppointments", label: "Próximos Agendamentos (Lista)" },
              { key: "showPopularServices", label: "Serviços Populares (Gráfico)" }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 border border-border rounded-xl">
                <span className="font-medium">{item.label}</span>
                <button 
                  onClick={() => handleToggle(item.key as keyof DashboardConfig)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${localConfig[item.key as keyof DashboardConfig] ? 'bg-success' : 'bg-bg-tertiary'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute transition-all ${localConfig[item.key as keyof DashboardConfig] ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-2 border-t border-border">
            <button 
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover active:scale-95 transition-all shadow-glow"
            >
              <Check className="w-5 h-5" /> Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
