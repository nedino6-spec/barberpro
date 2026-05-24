import { NextResponse } from "next/server";
import { getAiTimeSuggestion } from "@/lib/ai/suggestions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const barberId = searchParams.get("barberId");

    if (!date || !barberId) {
      return NextResponse.json({ error: "Date and barberId are required" }, { status: 400 });
    }

    const suggestion = await getAiTimeSuggestion(barberId, date);

    return NextResponse.json({ suggestion });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar sugestão da IA" }, { status: 500 });
  }
}
