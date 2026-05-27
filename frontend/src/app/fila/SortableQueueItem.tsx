"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, Scissors, XCircle, GripVertical, AlertCircle, PlayCircle, MapPin } from "lucide-react";

export function SortableQueueItem({ 
  item, 
  index, 
  onStatusChange, 
  onCheckout 
}: { 
  item: any; 
  index: number; 
  onStatusChange: (id: string, status: string) => void;
  onCheckout: (item: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const isWaiting = item.status === "WAITING";
  const isInProgress = item.status === "IN_PROGRESS";
  const isNext = item.status === "NEXT";
  const isAbsent = item.status === "ABSENT";
  const isInTransit = item.status === "IN_TRANSIT";

  return (
    <motion.div 
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex flex-col sm:flex-row items-start sm:items-center bg-slate-900/40 border ${isDragging ? 'border-primary shadow-2xl scale-[1.02]' : 'border-white/5'} rounded-xl p-3 md:p-4 relative overflow-hidden transition-all ${isInProgress ? 'ring-2 ring-primary/50 bg-primary/5' : ''} ${isNext ? 'ring-1 ring-amber-500/50 bg-amber-500/5' : ''} ${isAbsent ? 'opacity-50 grayscale' : ''}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${isInProgress ? 'bg-primary' : isNext ? 'bg-amber-500' : isAbsent ? 'bg-rose-500' : 'bg-slate-600'}`}></div>
      
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="px-2 py-4 cursor-grab active:cursor-grabbing text-slate-500 hover:text-white transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-1 flex items-center gap-3 pl-1 mb-3 sm:mb-0">
        <div className="text-2xl font-black text-white/20 w-8 text-center">
          {index + 1}
        </div>
        
        <div className="flex-1">
          <strong className="text-base font-bold block text-white">
            {item.customer?.name || "Cliente " + item.customerId}
          </strong>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
            {isInProgress && <span className="text-primary flex items-center gap-1"><Scissors className="w-3.5 h-3.5" /> Atendimento</span>}
            {isNext && <span className="text-amber-400 flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> É o próximo</span>}
            {isInTransit && <span className="text-blue-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Em deslocamento</span>}
            {isAbsent && <span className="text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Ausente</span>}
            {!isInProgress && !isAbsent && (
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Est.: {item.estimatedWaitMins} min</span>
            )}
            {item.barber && (
               <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                 Barbeiro: {item.barber.name}
               </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto pl-10 sm:pl-0">
        {/* Ações Rápidas Baseadas no Status */}
        {(isWaiting || isInTransit || isAbsent) && (
          <>
            <button onClick={() => onStatusChange(item.id, "NEXT")} className="text-xs font-bold text-amber-100 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg transition-all">
              Chamar Próximo
            </button>
            <button onClick={() => onStatusChange(item.id, "IN_PROGRESS")} className="text-xs font-bold text-white bg-primary/20 border border-primary/30 hover:bg-primary/30 px-3 py-1.5 rounded-lg transition-all">
              Atender
            </button>
          </>
        )}

        {isNext && (
          <button onClick={() => onStatusChange(item.id, "IN_PROGRESS")} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-primary/20 border border-primary/30 hover:bg-primary/30 px-3 py-1.5 rounded-lg transition-all animate-pulse">
            <Scissors className="w-3.5 h-3.5" /> Iniciar
          </button>
        )}

        {isInProgress && (
          <button onClick={() => onCheckout(item)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-100 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg transition-all">
            <CheckCircle2 className="w-3.5 h-3.5" /> Cobrar
          </button>
        )}

        {/* Dropdown / Mais ações */}
        <select 
           className="bg-slate-800 border border-white/10 text-xs text-slate-300 rounded-lg px-2 py-1.5 outline-none hover:border-white/20"
           value=""
           onChange={(e) => {
             if (e.target.value) onStatusChange(item.id, e.target.value);
           }}
        >
          <option value="" disabled>Status...</option>
          <option value="WAITING">Aguardando</option>
          <option value="IN_TRANSIT">Em Deslocamento</option>
          <option value="ABSENT">Marcar Ausente</option>
        </select>

        <button 
          onClick={() => onStatusChange(item.id, "CANCELLED")}
          className="flex items-center justify-center text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
          title="Cancelar/Remover"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
