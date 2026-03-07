import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const dateString = searchParams.get('date'); // Format: YYYY-MM-DD

  if (!userId || !dateString) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  try {
    let log = await prisma.dailyLog.findUnique({
      where: { userId_dateString: { userId, dateString } }
    });

    if (!log) {
      log = await prisma.dailyLog.create({
        data: { userId, dateString, waterLiters: 0, steps: 0, medsTaken: false }
      });
    }

    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vitals' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, dateString, waterLiters, steps, medsTaken, notes } = await req.json();

    const log = await prisma.dailyLog.upsert({
      where: { userId_dateString: { userId, dateString } },
      update: { waterLiters, steps, medsTaken, notes },
      create: { userId, dateString, waterLiters, steps, medsTaken, notes }
    });

    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save vitals' }, { status: 500 });
  }
}