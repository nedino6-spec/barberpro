import { prisma } from "@/lib/prisma";

export async function getAiTimeSuggestion(barberId: string, date: string): Promise<string | null> {
  try {
    // Busca o histórico de agendamentos deste barbeiro para o mesmo dia da semana
    const dayOfWeek = new Date(date).getDay();
    
    // Análise simples baseada em horários menos concorridos (Onde a IA atua para lotar horários vazios)
    // Em produção, isso bateria num modelo treinado (Ex: OpenAI ou Modelos locais com ML.js)
    // Para MVP, vamos calcular o slot com menor densidade histórica.
    
    // Todos os agendamentos do barbeiro
    const allAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        status: { not: "CANCELLED" }
      }
    });

    const frequencyMap: Record<string, number> = {};
    allAppointments.forEach(apt => {
      // Conta quantas vezes cada horário foi agendado
      const time = apt.startTime;
      frequencyMap[time] = (frequencyMap[time] || 0) + 1;
    });

    // Busca agendamentos de HOJE para ver o que já está ocupado
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        date: new Date(date),
        status: { not: "CANCELLED" }
      }
    });

    const occupiedSlots = new Set(todayAppointments.map(a => a.startTime));
    
    // Horários comerciais padrões (08:00 às 20:00)
    const availableSlots = [
      "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
    ].filter(slot => !occupiedSlots.has(slot));

    if (availableSlots.length === 0) return null;

    // A "Inteligência" aqui é sugerir o horário que costuma ficar MAIS VAZIO historicamente (para preencher o buraco na agenda)
    // Ordena os horários disponíveis pelo MENOR número de agendamentos no histórico
    availableSlots.sort((a, b) => (frequencyMap[a] || 0) - (frequencyMap[b] || 0));

    return availableSlots[0]; // Retorna a melhor sugestão de slot vago
  } catch (error) {
    console.error("Erro na IA de Sugestão:", error);
    return null;
  }
}
