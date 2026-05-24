import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// Vamos usar uma função de queue aqui (a ser criada)
import { enqueueGoogleSyncJob } from "@/lib/queue/google-sync";

export async function POST(request: Request) {
  // Google envia Headers específicos
  const channelId = request.headers.get("x-goog-channel-id");
  const resourceId = request.headers.get("x-goog-resource-id");
  const state = request.headers.get("x-goog-resource-state"); // "sync" ou "exists"

  if (!channelId || !resourceId) {
    return NextResponse.json({ error: "Missing Google Headers" }, { status: 400 });
  }

  // Encontra qual integração (barbeiro) pertence esse webhook
  const integration = await prisma.googleIntegration.findFirst({
    where: { channelId, resourceId },
  });

  if (!integration) {
    // Se não achou, responde OK para o Google parar de tentar, mas ignoramos.
    return new NextResponse("OK", { status: 200 });
  }

  // Dispara o Job no BullMQ para processar em Background
  // Assim o webhook responde em milisegundos e o processamento real (verificar conflitos, inserir no banco)
  // acontece na fila.
  await enqueueGoogleSyncJob(integration.userId);

  return new NextResponse("OK", { status: 200 });
}
