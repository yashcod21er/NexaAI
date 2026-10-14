import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Paperclip,
  Globe,
  Brain,
  Code2,
  X,
  FileText,
  FileCode,
  FileSpreadsheet,
  File,
} from "lucide-react";

// Format bytes into clean human-readable size
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
    return <FileCode size={18} className="attachment-icon-code" />;
  }
  if (["csv", "xlsx", "xls"].includes(ext)) {
    return <FileSpreadsheet size={18} className="attachment-icon-sheet" />;
  }
  if (["pdf", "txt", "md", "doc", "docx"].includes(ext)) {
    return <FileText size={18} className="attachment-icon-text" />;
  }
  return <File size={18} className="attachment-icon-file" />;
};

// Fast client-side image compression: converts multi-megabyte images to crisp, lightweight 1200px WebP/JPEG
const compressImage = (file, maxDim = 1200, quality = 0.82) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};

// Clean text file reader with safety truncation
const readTextFile = (file, maxChars = 30000) => {
  return new Promise((resolve) => {
    const ext = file.name?.split(".").pop()?.toLowerCase() || "";
    const textExtensions = [
      "txt", "md", "csv", "json", "js", "jsx", "ts", "tsx", "py",
      "html", "css", "scss", "xml", "yaml", "yml", "c", "cpp", "h",
      "java", "sql", "sh", "bat", "env", "log"
    ];

    if (!textExtensions.includes(ext) && !file.type.startsWith("text/")) {
      resolve(`[Attached Document: ${file.name} (${formatFileSize(file.size)})]`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      let content = typeof e.target.result === "string" ? e.target.result : "";
      if (content.length > maxChars) {
        content = content.slice(0, maxChars) + `\n\n...[Truncated: file exceeds ${maxChars} characters]`;
      }
      resolve(content);
    };
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
};

export default function ChatInput({
  onSendMessage,
  isLoading,
  isHomeCenter = false,
  placeholder,
}) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [webSearchActive, setWebSearchActive] = useState(false);
  const [deepReasonActive, setDeepReasonActive] = useState(false);
  const [codeModeActive, setCodeModeActive] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight = isHomeCenter ? 240 : 200;
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  }, [input, isHomeCenter]);

  // Focus textarea when on home screen
  useEffect(() => {
    if (isHomeCenter && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isHomeCenter]);

// Read any file as base64 dataUrl
const readFileAsDataUrl = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result || "");
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};

  // Smooth, batched file processing with compression & instant feedback
  const processFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList);
    setIsProcessing(true);

    try {
      const processedItems = await Promise.all(
        filesArray.map(async (file) => {
          if (file.size > 25 * 1024 * 1024) {
            alert(`File "${file.name}" exceeds the 25MB limit.`);
            return null;
          }

          const isImage = file.type.startsWith("image/");
          if (isImage) {
            const dataUrl = await compressImage(file);
            return {
              id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              size: file.size,
              type: file.type,
              isImage: true,
              dataUrl,
            };
          } else {
            const [textContent, dataUrl] = await Promise.all([
              readTextFile(file),
              readFileAsDataUrl(file),
            ]);
            return {
              id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              size: file.size,
              type: file.type || "application/octet-stream",
              isImage: false,
              textContent,
              dataUrl,
            };
          }
        })
      );

      const validItems = processedItems.filter(Boolean);
      if (validItems.length > 0) {
        setAttachments((prev) => [...prev, ...validItems]);
      }
    } catch (err) {
      console.error("Error processing files:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
    e.target.value = "";
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Flicker-free drag-and-drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);
    if (e.dataTransfer?.files?.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Robust paste handler for screenshots and copied files
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      e.preventDefault();
      processFiles(files);
    }
  };

  const hasText = input.trim().length > 0;
  const canSend = (hasText || attachments.length > 0) && !isLoading && !isProcessing;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!canSend) return;

    let prefixes = [];
    if (webSearchActive) prefixes.push("[Web Search]");
    if (deepReasonActive) prefixes.push("[Deep Reasoning]");
    if (codeModeActive) prefixes.push("[Code Mode]");

    const messageToSend = prefixes.length > 0
      ? `${prefixes.join(" ")} ${input.trim()}`
      : input.trim();

    onSendMessage(messageToSend, attachments);
    setInput("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const defaultPlaceholder = isHomeCenter
    ? "Ask anything, write code, or explore ideas..."
    : "Message NexaAI...";

  return (
    <div className={isHomeCenter ? "home-center-input-wrapper" : "chatgpt-input-wrapper"}>
      <motion.div
        className={`chatgpt-input-capsule ${isHomeCenter ? "home-center-capsule" : ""} ${isDragging ? "drag-over" : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        initial={false}
        animate={{ y: 0, opacity: 1 }}
      >
        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.csv,.json,.js,.jsx,.ts,.tsx,.py,.html,.css,.md,.xml,.yaml,.yml,.c,.cpp,.h,.java,.sql"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        {/* Attachment Previews Tray */}
        <AnimatePresence>
          {(attachments.length > 0 || isProcessing) && (
            <motion.div
              className="input-attachments-tray"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 10 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.18 }}
            >
              {attachments.map((att) => (
                <motion.div
                  key={att.id}
                  className="attachment-preview-card"
                  initial={{ scale: 0.88, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.88, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {att.isImage ? (
                    <div className="attachment-thumb-wrap">
                      <img src={att.dataUrl} alt={att.name} className="attachment-thumb" />
                    </div>
                  ) : (
                    <div className="attachment-icon-wrap">
                      {getFileIcon(att.name)}
                    </div>
                  )}

                  <div className="attachment-meta">
                    <span className="attachment-filename" title={att.name}>
                      {att.name}
                    </span>
                    <span className="attachment-filesize">
                      {formatFileSize(att.size)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="attachment-remove-btn"
                    onClick={() => removeAttachment(att.id)}
                    title="Remove file"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              ))}

              {isProcessing && (
                <div className="attachment-loading-card">
                  <div className="attachment-loading-spinner" />
                  <span className="attachment-loading-text">Optimizing...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          rows={isHomeCenter ? 2 : 1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            placeholder ||
            (attachments.length > 0
              ? "Ask a question about attached files..."
              : defaultPlaceholder)
          }
          disabled={isLoading}
          className={`chatgpt-textarea ${isHomeCenter ? "home-textarea" : ""}`}
        />

        {/* Toolbar Below Textarea */}
        <div className="input-bottom-toolbar">
          <div className="toolbar-left-tools">
            {/* Attach button */}
            <motion.button
              type="button"
              className={`capsule-circle-btn ${attachments.length > 0 ? "has-attachments" : ""}`}
              title="Attach files, images, or documents"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                  fileInputRef.current.click();
                }
              }}
            >
              <Paperclip size={16} />
              {attachments.length > 0 && (
                <span className="attachment-count-badge">{attachments.length}</span>
              )}
            </motion.button>

            {/* Web Search Tool */}
            <motion.button
              type="button"
              className={`capsule-tool-pill ${webSearchActive ? "active search" : ""}`}
              title={webSearchActive ? "Web search enabled" : "Enable web search"}
              onClick={() => setWebSearchActive(!webSearchActive)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Globe size={15} />
              <span className="tool-pill-label">Search</span>
            </motion.button>

            {/* Deep Reasoning Tool */}
            <motion.button
              type="button"
              className={`capsule-tool-pill ${deepReasonActive ? "active reason" : ""}`}
              title={deepReasonActive ? "Deep reasoning enabled" : "Enable deep reasoning"}
              onClick={() => setDeepReasonActive(!deepReasonActive)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Brain size={15} />
              <span className="tool-pill-label">Reason</span>
            </motion.button>

            {/* Code Mode Tool */}
            <motion.button
              type="button"
              className={`capsule-tool-pill ${codeModeActive ? "active code" : ""}`}
              title={codeModeActive ? "Code mode enabled" : "Enable code mode"}
              onClick={() => setCodeModeActive(!codeModeActive)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Code2 size={15} />
              <span className="tool-pill-label">Code</span>
            </motion.button>
          </div>

          <div className="toolbar-right-tools">
            <motion.button
              type="button"
              className={`chatgpt-send-btn ${canSend ? "active" : ""}`}
              onClick={handleSubmit}
              disabled={!canSend}
              title={canSend ? "Send message (Enter)" : "Enter a message or attach a file"}
              whileHover={canSend ? { scale: 1.06 } : {}}
              whileTap={canSend ? { scale: 0.94 } : {}}
            >
              {isLoading ? (
                <div className="chatgpt-loading-spinner" />
              ) : (
                <ArrowUp size={17} strokeWidth={2.4} />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {!isHomeCenter && (
        <div className="chatgpt-disclaimer">
          NexaAI 4.0 can make mistakes. Verify critical code and information.
        </div>
      )}
    </div>
  );
}
