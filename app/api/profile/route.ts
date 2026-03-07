import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// 1. GET PROFILE (This is how the Settings Modal reads your saved data!)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: userId }
  });
  
  return NextResponse.json(profile);
}

// 2. SAVE OR UPDATE PROFILE
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId, email, firstName, lastName, age, gender, 
      weightKg, heightCm, bloodType, bodyShape, genotype, sugarLevel, isPregnant, allergies,
      conditions, currentMeds, language
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const safeEmail = email || `patient_${userId}@example.com`;

    try {
      await prisma.user.upsert({
        where: { id: userId },
        update: { email: safeEmail },
        create: { id: userId, email: safeEmail }
      });
    } catch (dbError) {
      console.warn("User sync warning:", dbError);
    }

    const safeAge = age ? parseInt(age) : null;
    const safeWeight = weightKg ? parseFloat(weightKg) : null;
    const safeHeight = heightCm ? parseFloat(heightCm) : null;
    const pregnancyStatus = isPregnant === 'true';

    const profile = await prisma.patientProfile.upsert({
      where: { userId: userId },
      update: {
        firstName, lastName, gender, bloodType, bodyShape, genotype, sugarLevel, isPregnant: pregnancyStatus, allergies, conditions, currentMeds, language,
        age: safeAge, weightKg: safeWeight, heightCm: safeHeight
      },
      create: {
        userId, firstName, lastName, gender, bloodType, bodyShape, genotype, sugarLevel, isPregnant: pregnancyStatus, allergies, conditions, currentMeds, language,
        age: safeAge, weightKg: safeWeight, heightCm: safeHeight
      }
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("Profile saving error:", error);
    return NextResponse.json({ error: error.message || 'Failed to save profile' }, { status: 500 });
  }
}