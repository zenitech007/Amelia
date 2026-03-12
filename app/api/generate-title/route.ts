// app/api/generate-title/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Make a call to your AI service (OpenAI, Gemini, or your FastAPI backend)
    // with a strict system prompt like:
    // "You are a title generator. Summarize the user's message into a concise 3-5 word title. Do not use quotes or punctuation."
    
    // Example mock response:
    const generatedTitle = "React Chat Integration"; 

    return NextResponse.json({ title: generatedTitle });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate title" }, { status: 500 });
  }
}