export function validateApiKey(): string {
  const apiKey = process.env.LIMITLESS_API_KEY;

  if (!apiKey) {
    console.error("Error: LIMITLESS_API_KEY environment variable is not set");
    process.exit(1);
  }

  if (!apiKey.trim()) {
    console.error("Error: LIMITLESS_API_KEY is empty");
    process.exit(1);
  }

  return apiKey;
}

export const LIMITLESS_API_KEY = validateApiKey();