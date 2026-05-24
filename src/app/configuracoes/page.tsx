"use client";

import { useEffect, useState } from "react";
import { Clock, Scissors, Plus, Save, Trash2, Edit2, AlertCircle, Crown } from "lucide-react";
import { motion } from "framer-motion";

const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<"services" | "hours" | "queue" | "plans" | "integrations">("services");
  
  // Services State
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<any>({ name: "", price: "", durationMinutes: "30", pointsEarned: "10" });

  // Hours State
  const [hours, setHours] = useState<any[]>([]);
  const [loadingHours, setLoadingHours] = useState(true);
  const [savingHours, setSavingHours] = useState(false);

  // Queue State
  const [queueConfig, setQueueConfig] = useState<any>({ queueOpenTime: "09:00", queueCloseTime: "18:00", isQueuePaused: false });
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [savingQueue, setSavingQueue] = useState(false);

  // Plans State
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>({ name: "", description: "", price: "" });

  // Integrations State
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);

  useEffect(() => {
    fetchServices();
    fetchHours();
    fetchQueueConfig();
    fetchPlans();
    fetchBarbers();
  }, []);

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const res = await fetch("/api/services");
      setServices(await res.json());
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchHours = async () => {
    setLoadingHours(true);
    try {
      const res = await fetch("/api/business-hours");
      setHours(await res.json());
    } finally {
      setLoadingHours(false);
    }
  };

  const fetchQueueConfig = async () => {
    setLoadingQueue(true);
    try {
      const res = await fetch("/api/config/queue");
      setQueueConfig(await res.json());
    } finally {
      setLoadingQueue(false);
    }
  };

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await fetch("/api/subscriptions/plans");
      setPlans(await res.json());
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchBarbers = async () => {
    setLoadingBarbers(true);
    try {
      const res = await fetch("/api/barbers");
      setBarbers(await res.json());
    } catch(e) {
      console.error(e);
    } finally {
      setLoadingBarbers(false);
    }
  };

  // --- Services Functions ---
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!currentService.id;
      const url = isEdit ? `/api/services/${currentService.id}` : "/api/services";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentService)
      });

      if (res.ok) {
        setIsServiceModalOpen(false);
        fetchServices();
      } else {
        alert("Erro ao salvar serviço");
      }
    } catch (e) {
      alert("Erro de conexão");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) fetchServices();
    } catch (e) {
      alert("Erro ao excluir");
    }
  };

  const openEditService = (srv: any) => {
    setCurrentService(srv);
    setIsServiceModalOpen(true);
  };

  const openNewService = () => {
    setCurrentService({ name: "", price: "", durationMinutes: "30", pointsEarned: "10" });
    setIsServiceModalOpen(true);
  };

  // --- Hours Functions ---
  const handleHourChange = (index: number, field: string, value: any) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], [field]: value };
    setHours(newHours);
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      const res = await fetch("/api/business-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hours)
      });
      if (res.ok) {
        alert("Horários atualizados com sucesso!");
      } else {
        alert("Erro ao salvar horários");
      }
    } catch (e) {
      alert("Erro de conexão");
    } finally {
      setSavingHours(false);
    }
  };

  const handleSaveQueueConfig = async () => {
    setSavingQueue(true);
    try {
      const res = await fetch("/api/config/queue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queueConfig)
      });
      if (res.ok) alert("Configurações da fila salvas com sucesso!");
      else alert("Erro ao salvar fila");
    } catch (e) {
      alert("Erro de conexão");
    } finally {
      setSavingQueue(false);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/subscriptions/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentPlan)
      });
      if (res.ok) {
        setIsPlanModalOpen(false);
        fetchPlans();
      } else {
        alert("Erro ao salvar plano");
      }
    } catch (e) {
      alert("Erro de conexão");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Gerencie seus serviços e horários de funcionamento.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-card border border-border rounded-xl w-full md:w-fit">
        <button 
          onClick={() => setActiveTab("services")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "services" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-bg-tertiary"}`}
        >
          <Scissors className="w-4 h-4" /> Serviços
        </button>
        <button 
          onClick={() => setActiveTab("hours")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "hours" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-bg-tertiary"}`}
        >
          <Clock className="w-4 h-4" /> Horários
        </button>
        <button 
          onClick={() => setActiveTab("queue")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "queue" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-bg-tertiary"}`}
        >
          <AlertCircle className="w-4 h-4" /> Fila Virtual
        </button>
        <button 
          onClick={() => setActiveTab("plans")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "plans" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-bg-tertiary"}`}
        >
          <Crown className="w-4 h-4" /> Clube VIP
        </button>
        <button 
          onClick={() => setActiveTab("integrations")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "integrations" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-bg-tertiary"}`}
        >
          Integrações
        </button>
      </div>

      {/* Content */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm"
      >
        {/* ===================== TAB SERVIÇOS ===================== */}
        {activeTab === "services" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Catálogo de Serviços</h2>
              <button onClick={openNewService} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover shadow-glow transition-all active:scale-95">
                <Plus className="w-4 h-4" /> Novo Serviço
              </button>
            </div>

            {loadingServices ? (
              <div className="text-center py-8 text-muted-foreground animate-pulse">Carregando serviços...</div>
            ) : services.length === 0 ? (
              <div className="text-center py-10 bg-background border border-dashed border-border rounded-xl text-muted-foreground">
                <Scissors className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>Nenhum serviço cadastrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-sm">
                      <th className="py-3 px-4 font-medium">Serviço</th>
                      <th className="py-3 px-4 font-medium">Preço</th>
                      <th className="py-3 px-4 font-medium">Duração</th>
                      <th className="py-3 px-4 font-medium">Pontos VIP</th>
                      <th className="py-3 px-4 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((srv) => (
                      <tr key={srv.id} className="border-b border-border hover:bg-background/50 transition-colors">
                        <td className="py-4 px-4 font-medium text-foreground">{srv.name}</td>
                        <td className="py-4 px-4 text-success font-bold">R$ {srv.price.toFixed(2)}</td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">{srv.durationMinutes} min</td>
                        <td className="py-4 px-4 text-sm text-primary font-medium">+{srv.pointsEarned} pts</td>
                        <td className="py-4 px-4 text-right">
                          <button onClick={() => openEditService(srv)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteService(srv.id)} className="p-2 text-muted-foreground hover:text-danger transition-colors ml-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB HORÁRIOS ===================== */}
        {activeTab === "hours" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Horários de Funcionamento</h2>
              <button 
                onClick={handleSaveHours}
                disabled={savingHours}
                className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-xl text-sm font-medium hover:bg-success/90 shadow-glow transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {savingHours ? 'Salvando...' : 'Salvar Tudo'}
              </button>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6 flex gap-3 text-warning-dark">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">Esses horários serão usados para definir a disponibilidade na Agenda. Marque um dia como "Fechado" caso não trabalhe (ex: Domingo).</p>
            </div>

            {loadingHours ? (
              <div className="text-center py-8 text-muted-foreground animate-pulse">Carregando horários...</div>
            ) : (
              <div className="flex flex-col gap-4">
                {hours.map((day, index) => (
                  <div key={day.dayOfWeek} className={`flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-xl transition-colors ${day.isClosed ? 'bg-background border-border opacity-60' : 'bg-card border-primary/20'}`}>
                    
                    <div className="w-full md:w-40 flex items-center justify-between md:justify-start gap-3">
                      <span className="font-bold text-foreground">{diasSemana[day.dayOfWeek]}</span>
                      <button 
                        onClick={() => handleHourChange(index, 'isClosed', !day.isClosed)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${!day.isClosed ? 'bg-success' : 'bg-muted'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute transition-all ${!day.isClosed ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    {!day.isClosed ? (
                      <div className="flex flex-wrap items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Abre:</span>
                          <input type="time" value={day.openTime || ''} onChange={(e) => handleHourChange(index, 'openTime', e.target.value)} className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-primary" />
                        </div>
                        
                        <div className="w-px h-6 bg-border hidden md:block mx-2"></div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Almoço (Início):</span>
                          <input type="time" value={day.breakStart || ''} onChange={(e) => handleHourChange(index, 'breakStart', e.target.value)} className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-warning" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Retorno:</span>
                          <input type="time" value={day.breakEnd || ''} onChange={(e) => handleHourChange(index, 'breakEnd', e.target.value)} className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-warning" />
                        </div>

                        <div className="w-px h-6 bg-border hidden md:block mx-2"></div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Fecha:</span>
                          <input type="time" value={day.closeTime || ''} onChange={(e) => handleHourChange(index, 'closeTime', e.target.value)} className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-danger" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 text-sm text-muted-foreground font-medium">
                        Fechado
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB FILA VIRTUAL ===================== */}
        {activeTab === "queue" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Controle da Fila Virtual</h2>
              <button 
                onClick={handleSaveQueueConfig}
                disabled={savingQueue}
                className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-xl text-sm font-medium hover:bg-success/90 shadow-glow transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {savingQueue ? 'Salvando...' : 'Salvar Tudo'}
              </button>
            </div>

            {loadingQueue ? (
              <div className="text-center py-8 text-muted-foreground animate-pulse">Carregando configurações...</div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* Botão de Pânico (Pausar Fila) */}
                <div className={`p-6 rounded-2xl border transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${queueConfig.isQueuePaused ? 'bg-danger/10 border-danger/20' : 'bg-card border-border'}`}>
                  <div>
                    <h3 className={`text-lg font-bold ${queueConfig.isQueuePaused ? 'text-danger' : 'text-foreground'}`}>
                      {queueConfig.isQueuePaused ? 'Fila Pausada (Interrompida)' : 'Fila Ativa (Funcionando)'}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Quando pausada, nenhum cliente consegue entrar na fila pelo celular ou WhatsApp.
                    </p>
                  </div>
                  <button 
                    onClick={() => setQueueConfig({...queueConfig, isQueuePaused: !queueConfig.isQueuePaused})}
                    className={`px-6 py-3 rounded-xl font-bold transition-all active:scale-95 ${queueConfig.isQueuePaused ? 'bg-success text-white shadow-glow' : 'bg-danger text-white shadow-glow'}`}
                  >
                    {queueConfig.isQueuePaused ? '▶ Retomar Fila Agora' : '⏸ Pausar Fila Agora'}
                  </button>
                </div>

                {/* Horários Automáticos */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">Horários Automáticos</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    A fila abrirá e fechará automaticamente todos os dias nestes horários fixos.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Abre às</label>
                      <input 
                        type="time" 
                        value={queueConfig.queueOpenTime}
                        onChange={(e) => setQueueConfig({...queueConfig, queueOpenTime: e.target.value})}
                        className="bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors font-medium text-lg" 
                      />
                    </div>
                    
                    <div className="hidden md:block w-8 h-px bg-border mt-6"></div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha às</label>
                      <input 
                        type="time" 
                        value={queueConfig.queueCloseTime}
                        onChange={(e) => setQueueConfig({...queueConfig, queueCloseTime: e.target.value})}
                        className="bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-danger transition-colors font-medium text-lg" 
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ===================== TAB PLANOS (CLUB) ===================== */}
        {activeTab === "plans" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Planos do Clube</h2>
              <button onClick={() => { setCurrentPlan({ name: "", description: "", price: "" }); setIsPlanModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover shadow-glow transition-all active:scale-95">
                <Plus className="w-4 h-4" /> Novo Plano
              </button>
            </div>

            {loadingPlans ? (
              <div className="text-center py-8 text-muted-foreground animate-pulse">Carregando planos...</div>
            ) : plans.length === 0 ? (
              <div className="text-center py-10 bg-background border border-dashed border-border rounded-xl text-muted-foreground">
                <p>Nenhum plano cadastrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="bg-background border border-border p-5 rounded-2xl shadow-sm hover:border-primary transition-colors">
                    <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <p className="text-2xl font-black text-primary mb-2">R$ {plan.price.toFixed(2)}</p>
                    <div className="text-xs font-bold text-muted-foreground uppercase bg-card border border-border px-3 py-1 rounded-full inline-block">Mensal</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB INTEGRAÇÕES ===================== */}
        {activeTab === "integrations" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Google Calendar 2-Way Sync</h2>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Conecte a conta do Google de cada barbeiro para ativar a sincronização bidirecional em tempo real.
            </p>

            {loadingBarbers ? (
              <div className="text-center py-8 text-muted-foreground animate-pulse">Carregando barbeiros...</div>
            ) : barbers.length === 0 ? (
              <div className="text-center py-10 bg-background border border-dashed border-border rounded-xl text-muted-foreground">
                <p>Nenhum barbeiro encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {barbers.map((barber) => (
                  <div key={barber.id} className="bg-background border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{barber.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {barber.googleIntegration ? "✅ Google Conectado" : "❌ Google Não Conectado"}
                      </p>
                    </div>
                    {barber.googleIntegration ? (
                      <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-xl font-bold text-sm">Ativo</div>
                    ) : (
                      <button 
                        onClick={() => window.location.href = `/api/google/auth?userId=${barber.id}`}
                        className="px-4 py-2 bg-[#4285F4] text-white rounded-xl font-bold text-sm shadow-glow transition-all hover:bg-[#3367d6]"
                      >
                        Conectar Google
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Modal Novo/Editar Serviço */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-bold">{currentService.id ? "Editar Serviço" : "Novo Serviço"}</h2>
            </div>
            
            <form onSubmit={handleSaveService} className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome do Serviço</label>
                <input required type="text" value={currentService.name} onChange={e => setCurrentService({...currentService, name: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-primary" placeholder="Ex: Corte Degradê" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preço (R$)</label>
                  <input required type="number" step="0.01" value={currentService.price} onChange={e => setCurrentService({...currentService, price: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-primary" placeholder="45.00" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Duração (Min)</label>
                  <input required type="number" value={currentService.durationMinutes} onChange={e => setCurrentService({...currentService, durationMinutes: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-primary" placeholder="30" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pontos VIP (Fidelidade)</label>
                <input required type="number" value={currentService.pointsEarned} onChange={e => setCurrentService({...currentService, pointsEarned: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-primary" placeholder="10" />
                <p className="text-xs text-muted-foreground mt-1">Quantos pontos o cliente ganha ao fazer este serviço.</p>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="flex-1 py-2.5 bg-background border border-border rounded-xl font-medium hover:bg-bg-tertiary">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-glow">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
