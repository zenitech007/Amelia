import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET: Load a specific chat and all its messages
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // <-- THE FIX: We must await the params in Next.js 16!
  
  const chat = await prisma.chat.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  });
  
  return NextResponse.json(chat || { messages: [] });
}

// 2. PATCH: Update a chat (Rename or Pin/Unpin)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  
  const chat = await prisma.chat.update({
    where: { id },
    data: body 
  });
  
  return NextResponse.json(chat);
}

// 3. DELETE: Permanently delete a chat and its messages
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await prisma.message.deleteMany({ where: { chatId: id } });
  await prisma.chat.delete({ where: { id } });
  
  return NextResponse.json({ success: true });
}