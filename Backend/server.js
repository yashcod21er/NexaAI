import dns from "node:dns";
// Ensure reliable public DNS resolution and IPv4 preference to avoid ISP IPv6 drops
try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
  console.warn("DNS server setup warning:", e.message);
}

import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chats.js"; 
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);

// 1. OpenAI SDK client connected to Google Gemini API
export const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// 2. Official Google Gen AI client
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDistPath = path.resolve(__dirname, "../Frontend/dist");

// Serve static frontend build if present
app.use(express.static(frontendDistPath));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    message: "NexaAI Backend is running with Gemini API!",
    models: ["gemini-flash-latest", "gemini-3.6-flash", "gemini-flash-lite-latest"],
  });
});

// Root & SPA fallback handler
app.get("/", (req, res, next) => {
  res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
    if (err) {
      res.json({
        status: "online",
        message: "NexaAI Backend is running with Gemini API!",
        models: ["gemini-flash-latest", "gemini-3.6-flash", "gemini-flash-lite-latest"],
      });
    }
  });
});

// Chat endpoint using OpenAI SDK (compatible with ChatGPT/OpenAI frontend callers)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, message, model = "gemini-flash-latest" } = req.body;

    const chatMessages = messages || [
      { role: "user", content: message || "Hello" },
    ];

    const completion = await openai.chat.completions.create({
      model: model,
      messages: chatMessages,
    });

    res.json({
      success: true,
      reply: completion.choices[0].message.content,
      raw: completion,
    });
  } catch (error) {
    console.error("OpenAI Chat API error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate response",
    });
  }
});

// Streaming Chat endpoint using OpenAI SDK
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { messages, message, model = "gemini-flash-latest" } = req.body;

    const chatMessages = messages || [
      { role: "user", content: message || "Hello" },
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: model,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("OpenAI Stream API error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
});

// Alternative endpoint using native Google GenAI Interactions API
app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt, model = "gemini-flash-latest" } = req.body;

    const interaction = await ai.interactions.create({
      model: model,
      input: prompt || "Explain how AI works in a few words",
    });

    res.json({
      success: true,
      reply: interaction.output_text,
    });
  } catch (error) {
    console.error("GoogleGenAI API error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate response",
    });
  }
// Client-side SPA routing fallback
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`🚀 NexaAI Server listening on http://localhost:${PORT}`);
});