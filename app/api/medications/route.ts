import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'; // Adjust path if your prisma file is elsewhere
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client for token verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper function to verify the user's token
async function verifyUser(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) return null;
  return data.user;
}

// ==========================================
// GET: Fetch all active medications for user
// ==========================================
export async function GET(req: Request) {
  try {
    const user = await verifyUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const medications = await prisma.medication.findMany({
      where: { 
        userId: user.id,
        isActive: true // Only get active meds
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(medications);
  } catch (error) {
    console.error("Error fetching medications:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ==========================================
// POST: Save a new medication from Amelia
// ==========================================
export async function POST(req: Request) {
  try {
    const user = await verifyUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, dosage, frequency, instructions } = await req.json();

    if (!name || !dosage || !frequency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newMedication = await prisma.medication.create({
      data: {
        userId: user.id,
        name,
        dosage,
        frequency,
        instructions: instructions || null,
      }
    });

    return NextResponse.json(newMedication);
  } catch (error) {
    console.error("Error saving medication:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}