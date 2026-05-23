"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserCircle2, Phone, Save, Ban, Clock, CalendarCheck } from "lucide-react";

export default function ClientePerfilPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchCustomer();
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/clientes/${params.id}`);
      if (!res.ok) throw new Error("Não encontrado");
      const data = await res.json();
      setCustomer(data);
      setName(data.name || "");
      setPhone(data.phone || "");
      setNotes(data.notes || "");
    } catch (e) {
      alert("Cliente não encontrado.");
      router.push("/clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/clientes/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, notes })
      });
      if (res.ok) alert("Perfil atualizado com sucesso!");
      else alert("Erro ao salvar.");
    } catch (e) {
      alert("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  };

  const toggleBlock = async () => {
    const isBlocking = !customer.isBlocked;
    const confirmMsg = isBlocking 
      ? "Tem certeza que deseja BLOQUEAR este cliente? Ele não poderá mais entrar na fila." 
      : "Deseja DESBLOQUEAR este cliente?";
      
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/clientes/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: isBlocking })
      });
      if (res.ok) {
        setCustomer({ ...customer, isBlocked: isBlocking });
      }
    } catch (e) {
      alert("Erro ao alterar status de bloqueio.");
    }
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground animate-pulse font-bold">Carregando Perfil...</div>;
  if (!customer) return null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
      
      {/* Header com Voltar */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/clientes")} className="p-2 hover:bg-card rounded-full transition-colors border border-border bg-background">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            Perfil do Cliente
            {customer.isBlocked && <span className="bg-danger text-white text-[10px] px-2 py-1 rounded-md uppercase font-bold tracking-wider animate-pulse">Bloqueado</span>}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda - Formulario Principal */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <form onSubmit={handleSave} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="font-bold text-lg border-b border-border pb-3 flex items-center gap-2">
              <UserCircle2 className="w-5 h-5 text-primary" /> Dados Pessoais
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome Completo</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary font-medium" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Celular (WhatsApp)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    className="w-full mt-1 bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary font-medium" 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                Notas Internas (Secretas)
              </label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Cliente prefere máquina 2 na lateral, gosta de café sem açúcar..."
                className="w-full mt-1 bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-warning min-h-[120px] text-sm resize-none" 
              />
              <p className="text-[11px] text-muted-foreground mt-1">O cliente nunca verá essas anotações.</p>
            </div>

            <div className="flex justify-end mt-2">
              <button disabled={saving} type="submit" className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold shadow-glow transition-all active:scale-95 disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar Alteraçoes"}
              </button>
            </div>
          </form>

          {/* Histórico Recente */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg border-b border-border pb-3 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" /> Últimas Passagens (Fila/Agenda)
            </h2>
            {customer.appointments && customer.appointments.length > 0 ? (
              <div className="flex flex-col gap-3">
                {customer.appointments.map((apt: any) => (
                  <div key={apt.id} className="flex justify-between items-center p-3 border border-border rounded-lg bg-background">
                    <div className="flex items-center gap-3">
                      <CalendarCheck className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-bold text-sm">Corte de Cabelo (Automático)</p>
                        <p className="text-xs text-muted-foreground">{new Date(apt.date).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">Nenhum histórico registrado ainda.</p>
            )}
          </div>
        </div>

        {/* Coluna Direita - Painel de Controle */}
        <div className="flex flex-col gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg border-b border-border pb-3 mb-4 text-foreground">
              Métricas
            </h2>
            <div className="flex flex-col gap-4">
              <div className="bg-background rounded-xl p-4 border border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total de Visitas</p>
                <p className="text-3xl font-black text-primary">{customer.totalVisits}</p>
              </div>
              <div className="bg-background rounded-xl p-4 border border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Cliente Desde</p>
                <p className="text-sm font-bold text-foreground">{new Date(customer.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>

          <div className="bg-danger/5 border border-danger/20 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg border-b border-danger/20 pb-3 mb-4 text-danger flex items-center gap-2">
              <Ban className="w-5 h-5" /> Área de Risco
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {customer.isBlocked 
                ? "Este cliente está bloqueado e não pode utilizar a Fila Virtual e nem o Agendamento."
                : "Bloquear impede que este cliente entre na Fila Virtual ou realize agendamentos online."}
            </p>
            <button 
              onClick={toggleBlock}
              className={`w-full py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 ${customer.isBlocked ? 'bg-success hover:bg-success/90 text-white' : 'bg-danger hover:bg-danger/90 text-white shadow-glow'}`}
            >
              {customer.isBlocked ? "Desbloquear Cliente" : "Bloquear Cliente"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
