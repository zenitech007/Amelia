import OpenAI from "openai";
import { getUserMemory, saveMemory } from "@/lib/memory";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate AI response with patient memory
 */
export async function generateAIResponseWithMemory(
  userId: string,
  message: string
) {

  // Save the new observation
  await saveMemory(userId, message);

  // Retrieve patient memory
  const memory = await getUserMemory(userId);

  const symptoms = memory.symptoms.map(m => `- ${m.observation}`).join("\n");
  const medications = memory.medications.map(m => `- ${m.observation}`).join("\n");
  const allergies = memory.allergies.map(m => `- ${m.observation}`).join("\n");
  const vitals = memory.vitals.map(m => `- ${m.observation}`).join("\n");
  const diagnoses = memory.diagnoses.map(m => `- ${m.observation}`).join("\n");
  const lifestyle = memory.lifestyle.map(m => `- ${m.observation}`).join("\n");

  const prompt = `
You are Amelia, an AI medical assistant.

Use the patient medical record below when answering.

PATIENT RECORD

Diagnoses:
${diagnoses || "None recorded"}

Medications:
${medications || "None recorded"}

Allergies:
${allergies || "None recorded"}

Symptoms History:
${symptoms || "None recorded"}

Vitals History:
${vitals || "None recorded"}

Lifestyle Notes:
${lifestyle || "None recorded"}

PATIENT MESSAGE
${message}

Provide a medically responsible and helpful response.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "You are Amelia, a professional AI healthcare assistant."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return completion.choices?.[0]?.message?.content || "";
}