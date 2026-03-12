import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAIResponseWithMemory } from "@/lib/ai";

// --- CREATE NEW CHAT ---
export async function POST(req: Request) {
  try {
    const { title, firstMessage, role, userId, email } = await req.json();

    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    if (!firstMessage) return NextResponse.json({ error: "Missing first message" }, { status: 400 });

    // Ensure user exists
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: email || "unknown@email.com" },
    });

    const chat = await prisma.chat.create({
      data: {
        title,
        userId: user.id,
        messages: { create: { role, content: firstMessage } },
      },
      include: { messages: true },
    });

    const aiResponse = await generateAIResponseWithMemory(userId, firstMessage);

    await prisma.message.create({
      data: { chatId: chat.id, role: "assistant", content: aiResponse },
    });

    return NextResponse.json({ chat, aiResponse });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// --- APPEND MESSAGE TO EXISTING CHAT ---
export async function PUT(req: Request) {
  try {
    const { chatId, role, content, imageUrl } = await req.json();
    if (!chatId) return NextResponse.json({ error: "Missing chatId" }, { status: 400 });

    const message = await prisma.message.create({ data: { chatId, role, content, imageUrl } });
    return NextResponse.json(message);
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// --- GET ALL CHATS FOR USER ---
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { messages: true },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// --- PATCH: Update chat metadata (title, pinned) ---
export async function PATCH(req: Request) {
  try {
    const { chatId, title, isPinned } = await req.json();
    if (!chatId) return NextResponse.json({ error: "Missing chatId" }, { status: 400 });

    const updated = await prisma.chat.update({
      where: { id: chatId },
      data: { ...(title && { title }), ...(typeof isPinned === "boolean" && { isPinned }) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// --- DELETE A CHAT ---
export async function DELETE(req: Request) {
  try {
    const { chatId } = await req.json();
    if (!chatId) return NextResponse.json({ error: "Missing chatId" }, { status: 400 });

    await prisma.chat.delete({ where: { id: chatId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}