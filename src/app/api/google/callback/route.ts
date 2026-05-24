import { NextResponse } from "next/server";
import { getTokensFromCode, getCalendarClient } from "@/lib/google-calendar";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state"); // Nós passamos o userId no state
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/configuracoes?google_error=${error}`);
  }

  if (!code || !userId) {
    return NextResponse.json({ error: "Code and state (userId) are required" }, { status: 400 });
  }

  try {
    const tokens = await getTokensFromCode(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      // Se não veio refresh token, significa que o user já autorizou antes e a Google não reenviou.
      // Com prompt="consent" isso não deve acontecer, mas por precaução:
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/configuracoes?google_error=no_refresh_token`);
    }

    // Pega o Tenant do Usuário
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Insere ou atualiza a integração
    const integration = await prisma.googleIntegration.upsert({
      where: { userId },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      },
      create: {
        userId,
        tenantId: user?.tenantId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      },
    });

    // Registra Webhook para Push Notifications
    try {
      const calendar = getCalendarClient(tokens.access_token, tokens.refresh_token);
      const channelId = uuidv4();
      
      const watchResponse = await calendar.events.watch({
        calendarId: "primary",
        requestBody: {
          id: channelId,
          type: "web_hook",
          address: `${process.env.NEXT_PUBLIC_APP_URL}/api/google/webhook`,
        },
      });

      await prisma.googleIntegration.update({
        where: { id: integration.id },
        data: {
          channelId: watchResponse.data.id,
          resourceId: watchResponse.data.resourceId,
          channelExp: watchResponse.data.expiration ? new Date(parseInt(watchResponse.data.expiration)) : null,
        }
      });
      
    } catch (webhookError) {
      console.error("Erro ao registrar webhook no Google:", webhookError);
      // Não falhamos o login se o webhook falhar
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/configuracoes?google_success=true`);
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/configuracoes?google_error=${error.message}`);
  }
}
