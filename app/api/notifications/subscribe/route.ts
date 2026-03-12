import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma'; // Adjust this path if your prisma.ts is somewhere else
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase to verify the incoming Bearer token
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    // 1. Grab the token from the headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new NextResponse('Unauthorized: Missing header', { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 2. Verify the user is actually logged in
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return new NextResponse('Unauthorized: Invalid token', { status: 401 });
    }

    // 3. Parse the subscription data sent from the browser
    const subscriptionData = await req.json();
    if (!subscriptionData || !subscriptionData.endpoint) {
      return new NextResponse('Bad Request: Invalid subscription data', { status: 400 });
    }

    // 4. Save to Prisma (Update if exists, create if it's a new device)
    await prisma.pushSubscription.upsert({
      where: { userId: user.id },
      update: { subscription: subscriptionData },
      create: {
        userId: user.id,
        subscription: subscriptionData,
      },
    });

    return NextResponse.json({ message: 'Push subscription saved successfully.' }, { status: 200 });
    
  } catch (error) {
    console.error("Subscription Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}