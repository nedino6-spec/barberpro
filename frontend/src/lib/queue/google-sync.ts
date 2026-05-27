import { Queue } from "bullmq";
import redisConnection from "../redis";

let googleSyncQueue: Queue | null = null;

function getQueue() {
  if (!googleSyncQueue) {
    googleSyncQueue = new Queue("GoogleCalendarSync", {
      connection: redisConnection,
    });
  }
  return googleSyncQueue;
}

// Envia um job para sincronizar a agenda do Google para o Sistema (Inbound)
export async function enqueueGoogleSyncJob(userId: string) {
  await getQueue().add("sync-inbound", { userId }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  });
}

// Envia um job para sincronizar do Sistema para o Google (Outbound)
export async function enqueueSystemToGoogleJob(appointmentId: string, action: "CREATE" | "UPDATE" | "DELETE") {
  await getQueue().add("sync-outbound", { appointmentId, action }, {
    attempts: 5,
    backoff: { type: "exponential", delay: 5000 },
  });
}
