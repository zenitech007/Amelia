import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Example user ID (replace with actual Supabase user ID)
  const userId = "replace-with-real-user-id";

  // Example memories to seed
  const memories = [
    "Patient reported mild headaches in the morning.",
    "User prefers morning reminders for medication.",
    "Patient has a peanut allergy.",
    "Blood pressure readings have been stable for 2 weeks.",
  ];

  for (const observation of memories) {
    await prisma.medicalMemory.create({
      data: {
        observation,
        userId,
      },
    });
    console.log(`Added memory: "${observation}"`);
  }

  console.log("✅ All memories added successfully!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });