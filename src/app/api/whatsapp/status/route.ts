import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const botUrl = process.env.BOT_API_URL;
    
    // Se tivermos a URL do Koyeb ou do bot rodando separado, busca de lá
    if (botUrl) {
      try {
        const res = await fetch(`${botUrl}/status`);
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch (e) {
        console.error("Erro ao buscar status do bot externo:", e);
      }
      return NextResponse.json({ status: 'OFFLINE', qr: null });
    }

    // Fallback: Modo desenvolvimento local (lendo o arquivo json gerado pelo npm run bot)
    const stateFile = path.join(process.cwd(), 'whatsapp-state.json');
    
    if (!fs.existsSync(stateFile)) {
      return NextResponse.json({ status: 'OFFLINE', qr: null });
    }

    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json({ status: 'ERROR', qr: null }, { status: 500 });
  }
}
