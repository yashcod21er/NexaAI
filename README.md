# 🌟 NexaAI 4.0 — Next-Gen Intelligence Platform

> A full-stack, state-of-the-art AI conversation platform built with **React 19**, **Vite**, **Express**, **MongoDB Atlas**, and **Google Gemini API**. Features an authentic ChatGPT-style interface, full-screen authentication system, multi-modal document analysis, and dual-core AI model intelligence.

---

## ✨ Features

- ⚡ **Ultra-Low Latency Streaming**: Token-by-token streaming responses with smooth theory typing and instant code block rendering.
- 🎨 **ChatGPT-Identical UI & Aesthetics**: Dark theme, responsive sidebar with thread history, category prompt filters, and clean pill headers.
- 🔐 **Authentic ChatGPT Authentication**:
  - Full-screen login and signup pages matching OpenAI's typography and color scheme.
  - Email/password authentication with bcrypt hashing and 30-day JWT sessions.
  - 1-click social sign-in integration (Google, Microsoft, Apple).
  - Guest mode with instant bypass so users can chat without friction.
- 📄 **Multi-Modal Document & Resume Parsing**:
  - Native Base64 file attachment pipeline supporting **PDF** (`pdf-parse`) and **DOCX** (`mammoth`) text extraction.
  - Deep resume analysis, critique, and ATS scoring powered by Google Gemini.
- 🧠 **Dual-Core Model Selector**:
  - **NexaAI 4.0 Omni** (`gemini-flash-lite-latest` / `gemini-3.5-flash-lite`): Fast dual-core inference.
  - **Gemini 3.6 Flash**: Direct neural stream with ~190ms latency.
- 🛡️ **Enterprise Backend Resilience**:
  - In-memory cache fallback to ensure 100% uptime even during database reconnections.
  - Enforced IPv4 DNS resolution to prevent ISP socket drops on Windows environments.
  - Automatic rate-limit fallbacks across model endpoints.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Pure CSS (Tokens & Glassmorphism)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Markdown & Code**: `react-markdown` + `remark-gfm`

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Database**: MongoDB Atlas with Mongoose
- **AI SDK**: `@google/genai` & `openai` SDK (Gemini REST/SSE adapter)
- **Security**: `bcryptjs` + `jsonwebtoken`
- **Document Extractors**: `pdf-parse` & `mammoth`

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Google AI Studio Gemini API Key ([Get one here](https://aistudio.google.com/))
- A free MongoDB Atlas cluster ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 2. Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
```
Fill in your credentials in `Backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```
Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
In a new terminal:
```bash
cd Frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Project Structure

```
├── Backend/
│   ├── config/             # Database connection & DNS setup
│   ├── models/             # Mongoose schemas (User, Chat)
│   ├── routes/             # REST endpoints (auth, chats)
│   ├── services/           # Gemini API streaming & document extractors
│   ├── utils/              # JWT auth middlewares
│   ├── server.js           # Express app entrypoint
│   └── .env.example        # Environment variable template
├── Frontend/
│   ├── public/             # Static logos and favicons
│   ├── src/
│   │   ├── components/     # UI Components (ChatArea, Sidebar, AuthPage, NexaLogo, etc.)
│   │   ├── services/       # Frontend API client
│   │   ├── App.jsx         # Root app layout & routing
│   │   └── App.css         # Complete design system & styles
│   └── index.html          # HTML entry point
└── README.md               # Project documentation
```

---

## 📜 License
MIT License. Created by [yashcod21er](https://github.com/yashcod21er).
