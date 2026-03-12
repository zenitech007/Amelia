import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET all chats for the logged-in user
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const chats = await prisma.chat.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(chats);
}

// POST a new chat linked to the user
export async function POST(req: Request) {
  const { title, firstMessage, role, userId, email } = await req.json();
  
  // 1. Ensure the user exists in our public User table (Syncs with Supabase Auth)
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: email || 'unknown@email.com' }
  });

  // 2. Create the chat and link it to their User ID
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
}

// PUT (Update) a chat with a new message
export async function PUT(req: Request) {
  const { chatId, role, content } = await req.json();
  
  const message = await prisma.message.create({
    data: { chatId, role, content }
  });
  
  return NextResponse.json(message);
}