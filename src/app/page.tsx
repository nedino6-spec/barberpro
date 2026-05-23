"use client";

import { useEffect, useState } from "react";
import { Calendar, DollarSign, Users, Clock, Scissors, Plus, Settings, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { ConfiguracaoDashboardModal, DashboardConfig } from "@/components/dashboard/ConfiguracaoDashboardModal";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  const [config, setConfig] = useState<DashboardConfig>({
    showFinance: true,
    showAppointmentsCount: true,
    showNewCustomers: true,
    showUpcomingAppointments: true,
    showPopularServices: true,
  });

  useEffect(() => {
    // Load config from localStorage
    const saved = localStorage.getItem("dashboardConfig");
    if (saved) {
      try { setConfig(JSON.parse(saved)); } catch(e){}
    }

    // Fetch dashboard summary
    fetch("/api/dashboard/summary")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handleSaveConfig = (newConfig: DashboardConfig) => {
    setConfig(newConfig);
    localStorage.setItem("dashboardConfig", JSON.stringify(newConfig));
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Mobile / Desktop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Resumo das atividades de hoje.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsConfigOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium hover:bg-bg-tertiary transition-colors active:scale-95"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Configurar</span>
          </button>
          <button className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover shadow-glow transition-all active:scale-95">
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">Carregando painel...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            
            {config.showAppointmentsCount && (
              <motion.div variants={item} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Agendamentos (Hoje)</p>
                  <h3 className="text-2xl font-bold text-foreground mt-0.5">{data?.todayAppointmentsCount || 0}</h3>
                </div>
              </motion.div>
            )}
            
            {config.showFinance && (
              <motion.div variants={item} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/20 text-success flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Faturamento (Hoje)</p>
                  <h3 className="text-2xl font-bold text-success mt-0.5">{formatMoney(data?.todayRevenue)}</h3>
                </div>
              </motion.div>
            )}

            {config.showNewCustomers && (
              <motion.div variants={item} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/20 text-warning flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Novos Clientes</p>
                  <h3 className="text-2xl font-bold text-foreground mt-0.5">{data?.newCustomersCount || 0}</h3>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Main Grid */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Próximos Agendamentos */}
            {config.showUpcomingAppointments && (
              <motion.div variants={item} className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Próximos Agendamentos
                  </h2>
                  <button className="text-sm text-primary font-medium hover:underline">Ver Todos</button>
                </div>
                
                <div className="flex flex-col gap-3">
                  {data?.upcomingAppointments?.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">Nenhum agendamento para as próximas horas.</p>
                  ) : (
                    data?.upcomingAppointments?.map((appt: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3.5 bg-background border border-border rounded-xl">
                        <div className="flex gap-3.5 items-center">
                          <div className="text-lg font-bold text-primary w-14 text-center">{appt.time}</div>
                          <div className="w-px h-10 bg-border hidden sm:block"></div>
                          <div>
                            <div className="font-semibold text-foreground">{appt.name || "Cliente Não Informado"}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{appt.service || "Serviço Padrão"} • {appt.barber || "-"}</div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${appt.color}`}>
                          {appt.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Serviços Populares */}
            {config.showPopularServices && (
              <motion.div variants={item} className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-success" /> Serviços Populares
                  </h2>
                </div>
                
                <div className="flex flex-col gap-4">
                  {data?.popularServices?.map((srv: any, i: number) => (
                    <div key={i} className="relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium flex items-center gap-2">
                          <Scissors className="w-4 h-4 text-muted-foreground" /> {srv.name}
                        </span>
                        <span className="text-sm text-muted-foreground font-semibold">{srv.val}</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${srv.percent}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </motion.div>
        </>
      )}

      <ConfiguracaoDashboardModal 
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
