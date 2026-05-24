import { Queue } from "bullmq";
import redisConnection from "../redis";

export const googleSyncQueue = new Queue("GoogleCalendarSync", {
  connection: redisConnection,
});

// Envia um job para sincronizar a agenda do Google para o Sistema (Inbound)
export async function enqueueGoogleSyncJob(userId: string) {
  await googleSyncQueue.add("sync-inbound", { userId }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  });
}

// Envia um job para sincronizar do Sistema para o Google (Outbound)
export async function enqueueSystemToGoogleJob(appointmentId: string, action: "CREATE" | "UPDATE" | "DELETE") {
  await googleSyncQueue.add("sync-outbound", { appointmentId, action }, {
    attempts: 5,
    backoff: { type: "exponential", delay: 5000 },
  });
}
