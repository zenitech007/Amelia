import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    const chats = await prisma.chat.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(chats);
  } catch (error) {
    console.error("GET CHATS ERROR:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, firstMessage, role, userId, email } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });
    }

    // 1. Ensure the user exists (Upsert)
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { 
        id: userId, 
        email: email || 'unknown@email.com' 
      }
    });

    // 2. Create the chat
    const chat = await prisma.chat.create({
      data: {
        title,
        userId: user.id,
        messages: {
          create: { role, content: firstMessage }
        }
      },
      include: { messages: true }
    });
    
    return NextResponse.json(chat);
  } catch (error) {
    console.error("POST CHAT ERROR:", error);
    // This will show exactly why it failed in your Railway logs
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}
