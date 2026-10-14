import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

async function main() {
  console.log("Testing OpenAI SDK with Gemini Key...");
  try {
    const response = await client.chat.completions.create({
      model: "gemini-3.8-flash",
      messages: [{ role: "user", content: "Hello! Tell me an interesting one-liner fact about space." }],
    });

    console.log("\nResponse from Gemini via OpenAI SDK:");
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
