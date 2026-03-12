export function classifyMemory(text: string) {
  const msg = text.toLowerCase();

  if (msg.includes("pain") || msg.includes("headache") || msg.includes("fever"))
    return "SYMPTOM";

  if (msg.includes("take") || msg.includes("tablet") || msg.includes("mg"))
    return "MEDICATION";

  if (msg.includes("allergic") || msg.includes("allergy"))
    return "ALLERGY";

  if (msg.includes("blood pressure") || msg.includes("heart rate"))
    return "VITALS";

  if (msg.includes("diagnosed") || msg.includes("diabetes") || msg.includes("hypertension"))
    return "DIAGNOSIS";

  if (msg.includes("sleep") || msg.includes("exercise") || msg.includes("diet"))
    return "LIFESTYLE";

  return "NOTE";
}