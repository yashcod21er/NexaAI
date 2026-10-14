import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  console.log("Testing native Google GenAI Interactions API...");
  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: "Explain quantum computing in one short sentence.",
    });

    console.log("\nResponse from Gemini Interactions API:");
    console.log(interaction.output_text);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
