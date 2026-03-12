import { prisma } from "@/lib/prisma";

/**
 * Classify a medical observation
 */
export function classifyMemory(text: string): string {
  const msg = text.toLowerCase();

  if (msg.includes("pain") || msg.includes("headache") || msg.includes("fever"))
    return "SYMPTOM";

  if (msg.includes("tablet") || msg.includes("mg") || msg.includes("dose") || msg.includes("take"))
    return "MEDICATION";

  if (msg.includes("allergy") || msg.includes("allergic"))
    return "ALLERGY";

  if (msg.includes("blood pressure") || msg.includes("heart rate") || msg.includes("bpm"))
    return "VITALS";

  if (msg.includes("diagnosed") || msg.includes("diabetes") || msg.includes("hypertension"))
    return "DIAGNOSIS";

  if (msg.includes("sleep") || msg.includes("exercise") || msg.includes("diet"))
    return "LIFESTYLE";

  return "NOTE";
}


/**
 * Save memory (avoids duplicates)
 */
export async function saveMemory(userId: string, message: string) {

  const existing = await prisma.medicalMemory.findFirst({
    where: {
      userId,
      observation: message
    }
  });

  if (!existing) {

    const type = classifyMemory(message);

    await prisma.medicalMemory.create({
      data: {
        userId,
        observation: message,
        type
      }
    });
  }
}


/**
 * Retrieve structured memory
 */
export async function getUserMemory(userId: string) {

  const memories = await prisma.medicalMemory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return {
    symptoms: memories.filter(m => m.type === "SYMPTOM"),
    medications: memories.filter(m => m.type === "MEDICATION"),
    allergies: memories.filter(m => m.type === "ALLERGY"),
    vitals: memories.filter(m => m.type === "VITALS"),
    diagnoses: memories.filter(m => m.type === "DIAGNOSIS"),
    lifestyle: memories.filter(m => m.type === "LIFESTYLE"),
    notes: memories.filter(m => m.type === "NOTE")
  };
}