import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Em produção (Vercel), o WhatsApp roda separado
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ status: 'PRODUCTION_MODE', qr: null });
    }
    
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
