"use client";

import { Calendar, DollarSign, Users, Clock, Scissors, Plus, Filter, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Mobile / Desktop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Resumo das atividades de hoje.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium hover:bg-bg-tertiary transition-colors active:scale-95">
            <Filter className="w-4 h-4" />
            <span className="hidden md:inline">Hoje</span>
          </button>
          <button className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover shadow-glow transition-all active:scale-95">
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
      >
        <motion.div variants={item} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Agendamentos Hoje</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">24</h3>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/20 text-success flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Faturamento</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">R$ 1.250,00</h3>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/20 text-warning flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Novos Clientes</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">15</h3>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Próximos Agendamentos */}
        <motion.div variants={item} className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Próximos Agendamentos
            </h2>
            <button className="text-sm text-primary font-medium hover:underline">Ver Todos</button>
          </div>
          
          <div className="flex flex-col gap-3">
            {[
              { time: "14:00", name: "Carlos Silva", service: "Corte + Barba", barber: "João", status: "Aguardando", color: "text-warning bg-warning/10" },
              { time: "15:00", name: "Marcos Pereira", service: "Corte Degradê", barber: "Pedro", status: "Confirmado", color: "text-success bg-success/10" }
            ].map((appt, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-background border border-border rounded-xl">
                <div className="flex gap-3.5 items-center">
                  <div className="text-lg font-bold text-primary w-14 text-center">{appt.time}</div>
                  <div className="w-px h-10 bg-border hidden sm:block"></div>
                  <div>
                    <div className="font-semibold text-foreground">{appt.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{appt.service} • {appt.barber}</div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${appt.color}`}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Serviços Populares */}
        <motion.div variants={item} className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" /> Serviços Populares
            </h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {[
              { name: "Corte Degradê", percent: 45, val: "45%" },
              { name: "Corte + Barba", percent: 30, val: "30%" },
              { name: "Sobrancelha", percent: 15, val: "15%" },
            ].map((srv, i) => (
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
      </motion.div>
    </div>
  );
}
