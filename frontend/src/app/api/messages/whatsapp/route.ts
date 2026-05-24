import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Aqui seria a integração com WhatsApp (Cloud API, Evolution API, Baileys, etc)
    // payload ex: { to: '5511999999999', message: 'Seu horário está confirmado!' }
    
    console.log(`Enviando WhatsApp para ${payload.to}: ${payload.message}`);

    return NextResponse.json({ success: true, message: 'Mensagem enfileirada para envio' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
