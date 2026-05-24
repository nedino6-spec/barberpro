const { Worker } = require("bullmq");
const { PrismaClient } = require("@prisma/client");
const { google } = require("googleapis");
const Redis = require("ioredis");

const prisma = new PrismaClient();
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisConnection = new Redis(redisUrl, { maxRetriesPerRequest: null });

function getCalendarClient(accessToken, refreshToken) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
  return google.calendar({ version: "v3", auth: client });
}

const worker = new Worker("GoogleCalendarSync", async (job) => {
  const { name, data } = job;
  console.log(`[GoogleSyncWorker] Iniciando job ${name} (${job.id})`);

  if (name === "sync-outbound") {
    const { appointmentId, action } = data;
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { customer: true, barber: { include: { googleIntegration: true } }, service: true },
    });

    if (!appointment || !appointment.barber.googleIntegration) {
      return; // Barbeiro não tem integração com Google, ignoramos.
    }

    const integration = appointment.barber.googleIntegration;
    const calendar = getCalendarClient(integration.accessToken, integration.refreshToken);

    const eventPayload = {
      summary: `[BarberPro] ${appointment.service.name} - ${appointment.customer.name}`,
      description: `Cliente: ${appointment.customer.name}\nTelefone: ${appointment.customer.phone}\nServiço: ${appointment.service.name}\nStatus: ${appointment.status}`,
      start: { dateTime: new Date(`${appointment.date.toISOString().split('T')[0]}T${appointment.startTime}:00`).toISOString(), timeZone: "America/Sao_Paulo" },
      end: { dateTime: new Date(`${appointment.date.toISOString().split('T')[0]}T${appointment.endTime}:00`).toISOString(), timeZone: "America/Sao_Paulo" },
    };

    if (action === "CREATE") {
      const res = await calendar.events.insert({ calendarId: integration.calendarId, requestBody: eventPayload });
      await prisma.appointment.update({ where: { id: appointmentId }, data: { googleEventId: res.data.id } });
      console.log(`[GoogleSyncWorker] Evento criado no Google: ${res.data.id}`);
    } else if (action === "UPDATE" && appointment.googleEventId) {
      if (appointment.status === "CANCELLED") {
        await calendar.events.delete({ calendarId: integration.calendarId, eventId: appointment.googleEventId });
        console.log(`[GoogleSyncWorker] Evento deletado no Google: ${appointment.googleEventId}`);
      } else {
        await calendar.events.update({ calendarId: integration.calendarId, eventId: appointment.googleEventId, requestBody: eventPayload });
        console.log(`[GoogleSyncWorker] Evento atualizado no Google: ${appointment.googleEventId}`);
      }
    } else if (action === "DELETE" && appointment.googleEventId) {
      await calendar.events.delete({ calendarId: integration.calendarId, eventId: appointment.googleEventId });
      console.log(`[GoogleSyncWorker] Evento deletado no Google: ${appointment.googleEventId}`);
    }
  }

  if (name === "sync-inbound") {
    // Sincronizar Google -> Sistema (Lógica de leitura do SyncToken omitida por brevidade neste MVP)
    console.log(`[GoogleSyncWorker] Sincronização Inbound (Webhook) solicitada para o usuário ${data.userId}`);
  }

}, { connection: redisConnection });

worker.on("completed", (job) => console.log(`[GoogleSyncWorker] Job ${job.id} completo!`));
worker.on("failed", (job, err) => console.error(`[GoogleSyncWorker] Job ${job.id} falhou:`, err));

module.exports = worker;
