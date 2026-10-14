import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "model", "assistant", "gemini", "nexaAI"],
        default: "user",
    },
    sender: {
        type: String,
        default: "user",
    },
    content: {
        type: String,
        default: "",
    },
    message: {
        type: String,
        default: "",
    },
    attachments: [
        {
            id: { type: String, default: "" },
            name: { type: String, default: "" },
            type: { type: String, default: "" },
            size: { type: Number, default: 0 },
            dataUrl: { type: String, default: "" },
            textContent: { type: String, default: "" },
            isImage: { type: Boolean, default: false },
        },
    ],
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

messageSchema.pre("validate", function () {
    if (!this.content && this.message) {
        this.content = this.message;
    }
    if (!this.message && this.content) {
        this.message = this.content;
    }
    if (!this.role && this.sender) {
        this.role = this.sender;
    }
    if (!this.sender && this.role) {
        this.sender = this.role;
    }
});

const threadSchema = new mongoose.Schema({
    threadId: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString(),
        index: true,
    },
    userId: { type: String, index: true },
    title: { type: String, default: "New Chat" },
    messages: [messageSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Thread = mongoose.model("Thread", threadSchema);

export default Thread;