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
      <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Personalizar Dashboard</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-400">Escolha quais informações deseja exibir no seu painel principal.</p>

          <div className="flex flex-col gap-3">
            {[
              { key: "showFinance", label: "Faturamento do Dia" },
              { key: "showAppointmentsCount", label: "Qtd. Agendamentos" },
              { key: "showNewCustomers", label: "Novos Clientes" },
              { key: "showUpcomingAppointments", label: "Próximos Agendamentos" },
              { key: "showPopularServices", label: "Serviços Populares (Gráfico)" }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-white/10 rounded-xl">
                <span className="font-medium text-slate-300 text-sm">{item.label}</span>
                <button 
                  onClick={() => handleToggle(item.key as keyof DashboardConfig)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${localConfig[item.key as keyof DashboardConfig] ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute transition-all ${localConfig[item.key as keyof DashboardConfig] ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-4 border-t border-white/10">
            <button 
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] border-t border-blue-400/30"
            >
              <Check className="w-5 h-5" /> Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
