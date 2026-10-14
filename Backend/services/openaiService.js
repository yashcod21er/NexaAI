import OpenAI from "openai";
import "dotenv/config";
import { createRequire } from "module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Helper to extract text from PDFs, Word documents, or code/text attachments
const extractDocumentText = async (att) => {
    // 1. If textContent is already populated with actual content
    if (att.textContent && !att.textContent.startsWith("[Attached Document:")) {
        return att.textContent;
    }

    if (!att.dataUrl) {
        return att.textContent || `[File: ${att.name}]`;
    }

    const base64Data = att.dataUrl.replace(/^data:.*?;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const nameLower = (att.name || "").toLowerCase();

    // 2. PDF Documents (Resumes, Papers, Reports)
    if (nameLower.endsWith(".pdf") || att.type === "application/pdf") {
        try {
            const parser = new PDFParse({ data: buffer });
            const result = await parser.getText();
            const text = result?.text?.trim();
            if (text && text.length > 0) {
                console.log(`📄 Successfully parsed PDF (${att.name}): ${text.length} characters`);
                return text;
            }
        } catch (err) {
            console.warn(`PDF parse error for ${att.name}:`, err.message);
        }
    }

    // 3. Word Documents (.docx)
    if (nameLower.endsWith(".docx")) {
        try {
            const result = await mammoth.extractRawText({ buffer });
            const text = result?.value?.trim();
            if (text && text.length > 0) {
                console.log(`📄 Successfully parsed DOCX (${att.name}): ${text.length} characters`);
                return text;
            }
        } catch (err) {
            console.warn(`DOCX parse error for ${att.name}:`, err.message);
        }
    }

    // 4. Fallback text decoding if utf8
    try {
        const textSample = buffer.toString("utf8");
        if (/^[\x20-\x7E\s\u00A0-\uFFFF]+$/.test(textSample.slice(0, 500))) {
            return textSample;
        }
    } catch {}

    return att.textContent || `[Document: ${att.name}]`;
};

// Helper to format messages for the OpenAI / Gemini API with full attachment & multimodal vision support
const formatMessages = async (messages = []) => {
    const formatted = [];

    for (const m of messages) {
        const content = m.content || m.message || "";
        const sender = (m.sender || m.role || "user").toLowerCase();
        const role = sender === "user" ? "user" : "assistant";
        const attachments = m.attachments || [];

        if (role === "user" && attachments.length > 0) {
            const hasImages = attachments.some((a) => a.isImage && a.dataUrl);

            // Extract document texts from PDFs, Word docs, code files
            const docFiles = attachments.filter((a) => !a.isImage);
            const docTexts = [];

            for (const doc of docFiles) {
                const extracted = await extractDocumentText(doc);
                if (extracted) {
                    docTexts.push(`[Attached Document: ${doc.name}]\n\`\`\`\n${extracted}\n\`\`\``);
                }
            }

            if (hasImages) {
                const parts = [];
                let textPart = content || "Please analyze the attached file(s).";
                if (docTexts.length > 0) {
                    textPart += "\n\n" + docTexts.join("\n\n");
                }
                parts.push({ type: "text", text: textPart });

                for (const att of attachments) {
                    if (att.isImage && att.dataUrl) {
                        parts.push({
                            type: "image_url",
                            image_url: { url: att.dataUrl },
                        });
                    }
                }

                formatted.push({ role, content: parts });
            } else {
                let combined = content || "Please analyze the attached document(s).";
                if (docTexts.length > 0) {
                    combined += "\n\n" + docTexts.join("\n\n");
                }
                formatted.push({ role, content: combined });
            }
        } else {
            formatted.push({ role, content: String(content) });
        }
    }

    return formatted.filter((m) => {
        if (Array.isArray(m.content)) return m.content.length > 0;
        return typeof m.content === "string" && m.content.trim().length > 0;
    });
};

// High-speed verified models with high free-tier quotas and multimodal vision
const FAST_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.6-flash",
    "gemini-flash-latest",
];

// Helper to create non-streaming completion with automatic fallback
const createCompletionWithFallback = async (messages) => {
    let lastError = null;

    for (const model of FAST_MODELS) {
        try {
            const completion = await openai.chat.completions.create({
                model,
                messages,
            });
            return completion.choices[0]?.message?.content || "";
        } catch (err) {
            lastError = err;
            console.warn(`Model ${model} failed (${err.message}), trying fallback...`);
        }
    }
    throw lastError;
};

// Streaming Response Generator (Character-by-character / Token-by-token)
export const getOpenAIStreamResponse = async (messages) => {
    const formatted = await formatMessages(messages);
    const systemMessage = {
        role: "system",
        content:
            "You are NexaAI, an advanced, highly knowledgeable, and friendly AI assistant. When a user provides a resume or document, provide thorough, constructive, insightful analysis with actionable tips, ATS guidance, and formatting advice.",
    };

    const conversation = [systemMessage, ...formatted];
    let lastError = null;

    for (const model of FAST_MODELS) {
        try {
            const stream = await openai.chat.completions.create({
                model,
                messages: conversation,
                stream: true,
            });
            return stream;
        } catch (err) {
            lastError = err;
            console.warn(`Model ${model} stream failed (${err.message}), trying fallback...`);
        }
    }

    throw lastError || new Error("Failed to initialize AI stream");
};

// Non-streaming Gemini response via OpenAI SDK
export const getOpenAIResponse = async (messages) => {
    try {
        const formatted = await formatMessages(messages);
        if (formatted.length === 0) {
            return { content: "No message provided." };
        }

        const reply = await createCompletionWithFallback(formatted);
        return { content: reply || "No response received." };
    } catch (error) {
        console.error("Gemini/OpenAI Service Error:", error.message);
        return {
            content: `Error generating Gemini response: ${error.message}`,
        };
    }
};

// Non-streaming NexaAI response (with custom persona / instructions)
export const getNexaaiResponse = async (messages) => {
    try {
        const formatted = await formatMessages(messages);
        if (formatted.length === 0) {
            return { content: "No message provided." };
        }

        const systemMessage = {
            role: "system",
            content:
                "You are NexaAI, an advanced, highly knowledgeable, and friendly AI assistant. Give fast, clear, elegant, and helpful answers.",
        };

        const reply = await createCompletionWithFallback([systemMessage, ...formatted]);
        return { content: reply || "No response received from NexaAI." };
    } catch (error) {
        console.error("NexaAI Service Error:", error.message);
        return {
            content: `Error generating NexaAI response: ${error.message}`,
        };
    }
};

export default getOpenAIResponse;
