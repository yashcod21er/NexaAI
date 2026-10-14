import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  FileText,
  FileCode,
  FileSpreadsheet,
  File,
  X,
  Maximize2,
} from "lucide-react";

// Format bytes into readable string
const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

// Choose appropriate Lucide icon by file extension
const getFileIcon = (filename) => {
  const ext = filename?.split(".").pop()?.toLowerCase() || "";
  if (["js", "jsx", "ts", "tsx", "py", "html", "css", "c", "cpp", "java", "json", "sql", "sh"].includes(ext)) {
    return <FileCode size={16} className="attachment-icon-code" />;
  }
  if (["csv", "xlsx", "xls"].includes(ext)) {
    return <FileSpreadsheet size={16} className="attachment-icon-sheet" />;
  }
  if (["pdf", "txt", "md", "doc", "docx"].includes(ext)) {
    return <FileText size={16} className="attachment-icon-text" />;
  }
  return <File size={16} className="attachment-icon-file" />;
};

// ChatGPT Styled Code Block with Header and Copy Code Button
function CodeBlock({ inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeText = String(children).replace(/\n$/, "");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && (match || String(children).includes("\n"))) {
    return (
      <div className="chatgpt-codeblock">
        <div className="codeblock-header">
          <span className="codeblock-lang">{language || "code"}</span>
          <button type="button" className="copy-code-btn" onClick={handleCopy}>
            {copied ? <Check size={13} className="copied" /> : <Copy size={13} />}
            <span>{copied ? "Copied!" : "Copy code"}</span>
          </button>
        </div>
        <pre className="codeblock-pre">
          <code className={className} {...props}>
            {codeText}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <code className="inline-code" {...props}>
      {children}
    </code>
  );
}

/**
 * Custom hook to type out theory character-by-character while displaying code blocks instantly
 */
function useTheoryTypewriter(fullText, isStreaming) {
  const [everStreamed, setEverStreamed] = useState(Boolean(isStreaming));
  const [prevStreaming, setPrevStreaming] = useState(Boolean(isStreaming));
  if (isStreaming !== prevStreaming) {
    setPrevStreaming(Boolean(isStreaming));
    if (isStreaming) {
      setEverStreamed(true);
    }
  }

  const [displayedText, setDisplayedText] = useState(() =>
    isStreaming ? "" : fullText
  );
  const displayedLengthRef = useRef(isStreaming ? 0 : fullText.length);
  const fullTextRef = useRef(fullText);

  useEffect(() => {
    fullTextRef.current = fullText;
  }, [fullText]);

  const [isTyping, setIsTyping] = useState(Boolean(isStreaming));

  useEffect(() => {
    // If not a newly streamed message, show full text immediately without typewriter
    if (!everStreamed) {
      return;
    }

    let timer = null;

    const advance = () => {
      const target = fullTextRef.current;
      const currentLen = displayedLengthRef.current;

      if (currentLen >= target.length) {
        if (!isStreaming) {
          setIsTyping(false);
        }
        return;
      }

      setIsTyping(true);

      // Check if we are currently inside or about to enter a code block
      const textBefore = target.slice(0, currentLen);
      const codeBlockCount = (textBefore.match(/```/g) || []).length;
      const isInsideCode = codeBlockCount % 2 === 1;
      const startsCodeNow = target.slice(currentLen).startsWith("```");

      let nextLen;

      if (isInsideCode || startsCodeNow) {
        // CODE BLOCK: NO character-by-character delay!
        // Immediately reveal the whole code block at once
        const searchFrom = startsCodeNow ? currentLen + 3 : currentLen;
        const closingTriple = target.indexOf("```", searchFrom);

        if (closingTriple !== -1) {
          nextLen = closingTriple + 3; // Jump past completed code block
        } else {
          nextLen = target.length; // Code block in progress: show all code received so far
        }
      } else {
        // THEORY: Smooth character-by-character typewriter effect
        const backlog = target.length - currentLen;
        // Dynamic speed adjustment if backend stream is far ahead
        const step = backlog > 80 ? 3 : backlog > 40 ? 2 : 1;
        nextLen = Math.min(currentLen + step, target.length);
      }

      displayedLengthRef.current = nextLen;
      setDisplayedText(target.slice(0, nextLen));

      if (nextLen < target.length || isStreaming) {
        timer = setTimeout(advance, 14); // 14ms delay per theory character
      } else {
        setIsTyping(false);
      }
    };

    advance();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [fullText, isStreaming, everStreamed]);

  const outputText = everStreamed ? displayedText : fullText;
  return { outputText, isTyping: isTyping || isStreaming };
}

export default function ChatMessage({ message, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const sender = (message.sender || message.role || "user").toLowerCase();
  const isUser = sender === "user";
  const rawText = message.content || message.message || "";
  const attachments = message.attachments || [];

  // Apply theory-only typewriter effect for assistant responses
  const { outputText, isTyping } = useTheoryTypewriter(
    rawText,
    Boolean(message.isStreaming)
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  // Close image lightbox on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxImage(null);
    };
    if (lightboxImage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage]);

  if (isUser) {
    return (
      <>
        <div className="chatgpt-message-row user-row animate-fade-in">
          <div className="user-message-bubble">
            {/* Attached media / documents */}
            {attachments.length > 0 && (
              <div className="message-attachments-container">
                {/* Images grid */}
                {attachments.filter((a) => a.isImage && a.dataUrl).length > 0 && (
                  <div className="message-images-grid">
                    {attachments
                      .filter((a) => a.isImage && a.dataUrl)
                      .map((att, idx) => (
                        <div
                          key={att.id || idx}
                          className="message-image-card"
                          onClick={() => setLightboxImage(att)}
                          title="Click to view full image"
                        >
                          <img
                            src={att.dataUrl}
                            alt={att.name || "Attachment"}
                            className="message-image-thumb"
                          />
                          <div className="image-zoom-overlay">
                            <Maximize2 size={16} />
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* File chips (PDF, Code, Text, etc.) */}
                {attachments.filter((a) => !a.isImage).length > 0 && (
                  <div className="message-files-list">
                    {attachments
                      .filter((a) => !a.isImage)
                      .map((att, idx) => (
                        <div key={att.id || idx} className="message-file-chip">
                          <div className="file-chip-icon">
                            {getFileIcon(att.name)}
                          </div>
                          <div className="file-chip-info">
                            <span className="file-chip-name" title={att.name}>
                              {att.name}
                            </span>
                            <span className="file-chip-size">
                              {formatFileSize(att.size)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* User prompt text */}
            {rawText && <p className="user-text">{rawText}</p>}
          </div>
        </div>

        {/* Image Lightbox Modal */}
        {lightboxImage && (
          <div
            className="image-lightbox-backdrop"
            onClick={() => setLightboxImage(null)}
          >
            <div
              className="image-lightbox-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="image-lightbox-header">
                <span className="lightbox-filename">{lightboxImage.name}</span>
                <button
                  type="button"
                  className="lightbox-close-btn"
                  onClick={() => setLightboxImage(null)}
                  title="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="image-lightbox-body">
                <img
                  src={lightboxImage.dataUrl}
                  alt={lightboxImage.name}
                  className="lightbox-full-img"
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Assistant / NexaAI Message (Exact ChatGPT Markdown & Layout)
  return (
    <div className="chatgpt-message-row assistant-row animate-fade-in">
      <div className="assistant-content-container">
        {/* Assistant Avatar Icon */}
        <div className="assistant-avatar-icon" title="NexaAI">
          <Sparkles size={16} />
        </div>

        {/* Markdown Rendered Content with Theory-Only Typing */}
        <div className="assistant-markdown-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: CodeBlock,
            }}
          >
            {outputText}
          </ReactMarkdown>
          {isTyping && <span className="typing-cursor" />}
        </div>

        {/* ChatGPT Bottom Action Bar */}
        {!isTyping && rawText && (
          <div className="message-action-toolbar">
            <button
              type="button"
              className="action-icon-btn"
              onClick={handleCopy}
              title={copied ? "Copied" : "Copy response"}
            >
              {copied ? <Check size={15} className="copied" /> : <Copy size={15} />}
            </button>

            <button
              type="button"
              className={`action-icon-btn ${liked ? "active" : ""}`}
              onClick={handleLike}
              title="Good response"
            >
              <ThumbsUp size={15} />
            </button>

            <button
              type="button"
              className={`action-icon-btn ${disliked ? "active" : ""}`}
              onClick={handleDislike}
              title="Bad response"
            >
              <ThumbsDown size={15} />
            </button>

            {onRegenerate && (
              <button
                type="button"
                className="action-icon-btn"
                onClick={onRegenerate}
                title="Regenerate response"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
