import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Aqui processaríamos os webhooks enviados pelo Agendo Zap
    // Ex: status de confirmação, cancelamento, etc.
    
    console.log("Agendo Zap Webhook recebido:", payload);

    return NextResponse.json({ success: true, message: 'Webhook processado com sucesso' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
