import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

// Configure Web Push securely
webpush.setVapidDetails(
  'mailto:zenitech007@gmail.com', // Replace with your actual admin email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: Request) {
  // 1. Security Check: Ensure only Vercel Cron can trigger this endpoint
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized Cron Request', { status: 401 });
  }

  try {
    // 2. Query the database for users who have ACTIVE meds AND a Push Subscription
    const usersWithMeds = await prisma.user.findMany({
      where: {
        medications: { some: { isActive: true } },
        pushSubscription: { isNot: null }
      },
      include: {
        medications: { where: { isActive: true } },
        pushSubscription: true
      }
    });

    let sentCount = 0;

    // 3. Loop through those users and fire the alerts
    for (const user of usersWithMeds) {
      const rawSub = user.pushSubscription?.subscription;
      if (!rawSub) continue;

      // Prisma stores JSON, we ensure it's formatted for the web-push library
      const pushSubscription = typeof rawSub === 'string' ? JSON.parse(rawSub) : rawSub;

      // Build the notification payload
      const medNames = user.medications.map(m => m.name).join(', ');
      const payload = JSON.stringify({
        title: "Amelia MedTech 🩺",
        body: `Time for your medications: ${medNames}. Tap to view your schedule.`,
        url: "/" 
      });

      try {
        await webpush.sendNotification(pushSubscription as webpush.PushSubscription, payload);
        sentCount++;
      } catch (pushErr: any) {
        console.error(`Failed to send to user ${user.id}:`, pushErr);
        // If the user revoked permission (Status 410 Gone), clean up the database
        if (pushErr.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { userId: user.id } });
        }
      }
    }

    return NextResponse.json({ success: true, sentNotifications: sentCount });
  } catch (error) {
    console.error("Cron Execution Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}