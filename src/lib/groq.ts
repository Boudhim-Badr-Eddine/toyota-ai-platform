import Groq from "groq-sdk";

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }
  return new Groq({ apiKey });
}

export async function generateGroqCompletion(
  prompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const groq = getGroqClient();
  const result = await groq.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: options?.maxTokens ?? 256,
    temperature: options?.temperature ?? 0.7,
  });
  return result.choices[0]?.message?.content?.trim() ?? "";
}

export { DEFAULT_MODEL, getGroqClient };
