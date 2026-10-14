import express from "express";
import mongoose from "mongoose";
import Thread from "../models/thread.js";
import User from "../models/user.js";
import getOpenAIResponse, {
    getNexaaiResponse,
    getOpenAIStreamResponse,
} from "../services/openaiService.js";

const router = express.Router();

// High-speed in-memory fallback store when MongoDB Atlas is offline or connecting
const memThreads = new Map();

// Helper to check if MongoDB connection is active
const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to get a thread from DB or Memory
const findThread = async (targetId) => {
    if (isDbConnected()) {
        try {
            if (mongoose.Types.ObjectId.isValid(targetId)) {
                const byId = await Thread.findById(targetId);
                if (byId) return byId;
            }
            const byThreadId = await Thread.findOne({ threadId: targetId });
            if (byThreadId) return byThreadId;
        } catch (e) {
            console.warn("DB findThread fallback to memory:", e.message);
        }
    }
    return memThreads.get(targetId) || null;
};

// Create / Associate a thread with a user
router.post("/", async (req, res) => {
    try {
        const { userId, threadId } = req.body;

        if (!userId || !threadId) {
            return res.status(400).json({ success: false, error: "userId and threadId are required" });
        }

        let thread = await findThread(threadId);
        if (!thread) {
            const threadData = {
                userId,
                title: "New Chat",
                threadId,
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            if (isDbConnected()) {
                try {
                    const newThread = new Thread(threadData);
                    await newThread.save();
                    return res.json({ success: true, thread: newThread });
                } catch (e) {
                    console.warn("DB associate save failed, saving to memory:", e.message);
                }
            }
            memThreads.set(threadId, threadData);
            return res.json({ success: true, thread: threadData });
        }

        thread.userId = userId;
        if (thread.save) {
            await thread.save();
        } else {
            memThreads.set(threadId, thread);
        }

        res.json({ success: true, thread });
    } catch (error) {
        console.error("Thread associate error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create a new thread
router.post("/new-thread", async (req, res) => {
    try {
        const { userId, title } = req.body;
        const threadId = "thread_" + Date.now();
        const threadData = {
            userId: userId || "guest_user",
            title: title || "New Chat",
            threadId,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        if (isDbConnected()) {
            try {
                const thread = new Thread(threadData);
                await thread.save();
                return res.json({ success: true, thread });
            } catch (dbErr) {
                console.warn("Save new thread to DB failed, saving in memory:", dbErr.message);
            }
        }

        memThreads.set(threadId, threadData);
        res.json({ success: true, thread: threadData });
    } catch (error) {
        console.error("Create thread error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all threads for a user
router.get("/threads", async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ success: false, error: "userId is required" });
        }

        let dbThreads = [];
        if (isDbConnected()) {
            try {
                dbThreads = await Thread.find({ userId }).sort({ updatedAt: -1 });
            } catch (dbErr) {
                console.warn("Fetch threads from DB failed, using memory:", dbErr.message);
            }
        }

        const memUserThreads = Array.from(memThreads.values())
            .filter((t) => t.userId === userId || userId === "guest_user");

        // Merge DB threads with in-memory threads without duplicates
        const threadMap = new Map();
        for (const t of dbThreads) {
            const id = t.threadId || String(t._id);
            threadMap.set(id, t);
        }
        for (const t of memUserThreads) {
            const id = t.threadId || String(t._id);
            if (!threadMap.has(id)) {
                threadMap.set(id, t);
            }
        }

        const merged = Array.from(threadMap.values()).sort(
            (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );

        res.json({ success: true, threads: merged });
    } catch (error) {
        console.error("Thread fetch error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get a single thread by id
router.get("/thread/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const thread = await findThread(id);

        if (!thread) {
            return res.status(404).json({ success: false, error: "Thread not found" });
        }

        res.json({ success: true, thread });
    } catch (error) {
        console.error("Thread fetch error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a thread by id
router.delete("/thread/:id", async (req, res) => {
    try {
        const { id } = req.params;
        let thread = null;

        if (isDbConnected()) {
            try {
                if (mongoose.Types.ObjectId.isValid(id)) {
                    thread = await Thread.findByIdAndDelete(id);
                }
                if (!thread) {
                    thread = await Thread.findOneAndDelete({ threadId: id });
                }
            } catch (dbErr) {
                console.warn("DB delete failed, falling back to memory:", dbErr.message);
            }
        }

        if (!thread && memThreads.has(id)) {
            thread = memThreads.get(id);
        }
        memThreads.delete(id);

        if (!thread) {
            return res.status(404).json({ success: false, error: "Thread not found" });
        }

        res.json({ success: true, message: "Thread deleted successfully", thread });
    } catch (error) {
        console.error("Thread delete error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// STREAMING CHAT (Character-by-character / SSE real-time streaming)
router.post("/chat/stream", async (req, res) => {
    try {
        const { threadID, threadId, message, sender = "user", userId, attachments = [] } = req.body;
        const targetThreadId = threadID || threadId;

        if (!targetThreadId || (!message && (!attachments || attachments.length === 0))) {
            return res.status(400).json({
                success: false,
                error: "threadID and either message or attachments are required",
            });
        }

        const titleText = message
            ? (message.length > 30 ? message.slice(0, 30) + "..." : message)
            : (attachments[0]?.name ? `File: ${attachments[0].name}` : "New Chat");

        const userMsg = {
            sender: sender || "user",
            role: "user",
            message: message || "",
            content: message || "",
            attachments: attachments || [],
            timestamp: new Date(),
        };

        let threadMessages = [];
        let dbThread = null;
        let memThread = null;

        // Try database if connected
        if (isDbConnected()) {
            try {
                if (mongoose.Types.ObjectId.isValid(targetThreadId)) {
                    dbThread = await Thread.findById(targetThreadId);
                }
                if (!dbThread) {
                    dbThread = await Thread.findOne({ threadId: targetThreadId });
                }
                if (!dbThread) {
                    dbThread = new Thread({
                        userId: userId || "guest_user",
                        threadId: targetThreadId,
                        title: titleText,
                        messages: [],
                    });
                } else if (userId && (!dbThread.userId || dbThread.userId === "guest_user")) {
                    dbThread.userId = userId;
                }

                dbThread.messages.push(userMsg);
                await dbThread.save();
                threadMessages = dbThread.messages;
            } catch (dbErr) {
                console.warn("DB chat save failed, using memory fallback:", dbErr.message);
                dbThread = null;
            }
        }

        // Memory fallback if DB is not connected or threw an error
        if (!dbThread) {
            memThread = memThreads.get(targetThreadId);
            if (!memThread) {
                memThread = {
                    threadId: targetThreadId,
                    userId: userId || "guest_user",
                    title: titleText,
                    messages: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                memThreads.set(targetThreadId, memThread);
            }
            memThread.messages.push(userMsg);
            memThread.updatedAt = new Date();
            threadMessages = memThread.messages;
        }

        // SSE streaming headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        if (res.flushHeaders) res.flushHeaders();

        // Stream AI response tokens in real-time
        const stream = await getOpenAIStreamResponse(threadMessages);
        let fullReply = "";

        for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content || "";
            if (token) {
                fullReply += token;
                res.write(`data: ${JSON.stringify({ content: token })}\n\n`);
            }
        }

        const aiMsg = {
            sender: "nexaAI",
            role: "model",
            message: fullReply,
            content: fullReply,
            timestamp: new Date(),
        };

        if (dbThread) {
            try {
                dbThread.messages.push(aiMsg);
                dbThread.updatedAt = new Date();
                await dbThread.save();
            } catch (err) {
                console.warn("Saving AI reply to DB failed:", err.message);
            }
        } else if (memThread) {
            memThread.messages.push(aiMsg);
            memThread.updatedAt = new Date();
        }

        // Signal stream completion
        res.write(`data: ${JSON.stringify({ done: true, fullReply, threadId: targetThreadId })}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
    } catch (error) {
        console.error("Streaming error:", error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: error.message });
        } else {
            res.write(`data: ${JSON.stringify({ error: error.message || "Failed to generate AI response" })}\n\n`);
            res.write("data: [DONE]\n\n");
            res.end();
        }
    }
});

// Non-streaming chat endpoint (fallback)
router.post("/chat", async (req, res) => {
    try {
        const { threadID, threadId, message, sender = "user", attachments = [] } = req.body;
        const targetThreadId = threadID || threadId;

        if (!targetThreadId || (!message && (!attachments || attachments.length === 0))) {
            return res.status(400).json({
                success: false,
                error: "threadID and either message or attachments are required",
            });
        }

        const titleText = message
            ? (message.length > 30 ? message.slice(0, 30) + "..." : message)
            : (attachments[0]?.name ? `File: ${attachments[0].name}` : "New Chat");

        const userMsg = {
            sender: sender || "user",
            role: "user",
            message: message || "",
            content: message || "",
            attachments: attachments || [],
            timestamp: new Date(),
        };

        let threadMessages = [];
        let dbThread = null;
        let memThread = null;

        if (isDbConnected()) {
            try {
                if (mongoose.Types.ObjectId.isValid(targetThreadId)) {
                    dbThread = await Thread.findById(targetThreadId);
                }
                if (!dbThread) {
                    dbThread = await Thread.findOne({ threadId: targetThreadId });
                }
                if (!dbThread) {
                    dbThread = new Thread({
                        threadId: targetThreadId,
                        title: titleText,
                        messages: [],
                    });
                }
                dbThread.messages.push(userMsg);
                await dbThread.save();
                threadMessages = dbThread.messages;
            } catch (dbErr) {
                console.warn("DB chat fallback to memory:", dbErr.message);
                dbThread = null;
            }
        }

        if (!dbThread) {
            memThread = memThreads.get(targetThreadId);
            if (!memThread) {
                memThread = {
                    threadId: targetThreadId,
                    title: titleText,
                    messages: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                memThreads.set(targetThreadId, memThread);
            }
            memThread.messages.push(userMsg);
            threadMessages = memThread.messages;
        }

        const nexaAIresponse = await getNexaaiResponse(threadMessages);
        const aiMsg = {
            sender: "nexaAI",
            role: "model",
            message: nexaAIresponse.content,
            content: nexaAIresponse.content,
            timestamp: new Date(),
        };

        if (dbThread) {
            try {
                dbThread.messages.push(aiMsg);
                dbThread.updatedAt = new Date();
                await dbThread.save();
            } catch (err) {
                console.warn("DB save AI reply failed:", err.message);
            }
        } else if (memThread) {
            memThread.messages.push(aiMsg);
            memThread.updatedAt = new Date();
        }

        res.json({
            success: true,
            thread: dbThread || memThread,
            nexaAIresponse: nexaAIresponse.content,
        });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;