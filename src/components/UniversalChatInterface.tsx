"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, DragEvent as ReactDragEvent } from "react";
import {
  DEFAULT_SELECTED_OPENROUTER_MODEL,
  SELECTED_MODEL_STORAGE_KEY,
  isSupportedOpenRouterModel,
} from "@/lib/openrouterModels";
import { useAuth } from "@/hooks/useAuth";
import { getAssistant } from "@/app/collection/collection-data";
import { ModelPicker } from "@/components/ModelPicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  FileText,
  ChevronRight,
  Database,
  Globe,
  Grid3X3,
  Home,
  Library,
  Loader2,
  Mic,
  Package,
  Paperclip,
  Plus,
  Rocket,
  Send,
  Settings,
  Sparkles,
  Trophy,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
};

export default function UniversalChatInterface({ slug }: { slug: string }) {
  const assistant = getAssistant(slug) ?? getAssistant("brief-buddy")!;
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [selectedModelId, setSelectedModelId] = useState<string>(assistant.modelId || DEFAULT_SELECTED_OPENROUTER_MODEL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Persist model selection per-collection
  useEffect(() => {
    try {
      const storageKey = `${SELECTED_MODEL_STORAGE_KEY}:collection:${slug}`;
      const stored = window.localStorage.getItem(storageKey);
      const nextModelId =
        stored && isSupportedOpenRouterModel(stored)
          ? stored
          : assistant.modelId || DEFAULT_SELECTED_OPENROUTER_MODEL;
      setSelectedModelId(nextModelId);
    } catch {
      setSelectedModelId(assistant.modelId || DEFAULT_SELECTED_OPENROUTER_MODEL);
    }
  }, [assistant.modelId, slug]);

  useEffect(() => {
    try {
      const storageKey = `${SELECTED_MODEL_STORAGE_KEY}:collection:${slug}`;
      window.localStorage.setItem(storageKey, selectedModelId);
    } catch {
      // ignore
    }
  }, [selectedModelId, slug]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const supported = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/png", "image/jpeg", "image/gif", "application/zip"];
    
    Array.from(files).forEach((file) => {
      if (supported.includes(file.type)) {
        setAttachments((current) => [
          ...current,
          {
            id: Math.random().toString(36).slice(2),
            name: file.name,
            size: file.size,
            type: file.type,
          },
        ]);
      }
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((current) => current.filter((a) => a.id !== id));
  };

  const handleDragOver = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: ReactDragEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleVoiceInput = () => {
    type SpeechRecognitionConstructor = new () => {
      lang: string;
      interimResults: boolean;
      start: () => void;
      onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
    };
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setPrompt((current) => current || "Voice input is not supported in this browser.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setPrompt((current) => `${current}${current ? " " : ""}${transcript}`);
    };
    recognition.start();
  };

  const sendMessage = async () => {
    const text = prompt.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    setMessages((current) => [...current, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setPrompt("");
    setAttachments([]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          messages,
          selectedModel: selectedModelId,
          agent: slug,
        }),
      });

      if (!response.ok || !response.body) {
        const errText = await response.text();
        throw new Error(errText || "AI response failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((current) => {
          const lastIndex = current.length - 1;
          const updated = [...current];
          const last = updated[lastIndex];
          if (last && last.role === "assistant") {
            updated[lastIndex] = { ...last, content: last.content + chunk };
          }
          return updated;
        });
      }
    } catch (error) {
      console.warn("Chat send failed:", error);
      setMessages((current) => {
        const lastIndex = current.length - 1;
        const updated = [...current];
        const last = updated[lastIndex];
        if (last && last.role === "assistant") {
          updated[lastIndex] = { ...last, content: "Something went wrong. Please try again." };
        }
        return updated;
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 lg:flex flex-col p-4">
        <Link href="/collection" className="mb-8 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">LokoAI</span>
        </Link>

        <nav className="space-y-2 mb-8">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/integrations"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
          >
            <Grid3X3 className="h-4 w-4" />
            Integrations
          </Link>
          <Link
            href="/partners"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
          >
            <Users className="h-4 w-4" />
            Partners
          </Link>
          <Link
            href="/launchpad"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
          >
            <Rocket className="h-4 w-4" />
            Launchpad
          </Link>
          <Link
            href="/collection"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-800"
          >
            <Library className="h-4 w-4" />
            Collection
          </Link>
          <Link
            href="/affiliate"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
          >
            <Trophy className="h-4 w-4" />
            Affiliate
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
          >
            <Zap className="h-4 w-4" />
            Pricing
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 px-3 py-2">
            <p className="font-semibold mb-1">{user?.email}</p>
            <p>Using LokoAI</p>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-2xl space-y-6">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-lg rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-sky-500 text-white rounded-br-none"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none"
                  }`}
                >
                  <p className="leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div
          className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 sm:px-8 py-6"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
            <div className="mx-auto max-w-3xl">
            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm"
                  >
                    <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">{att.name}</span>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drag and Drop Area */}
            {isDragging && (
              <div className="mb-4 rounded-2xl border-2 border-dashed border-sky-400 bg-sky-50 dark:bg-sky-900/20 p-8 text-center">
                <Upload className="mx-auto h-8 w-8 text-sky-500 mb-2" />
                <p className="text-sm font-medium text-sky-700 dark:text-sky-400">Drag files here</p>
              </div>
            )}

            {/* Input Box */}
            <div className="relative flex flex-col rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)] transition-all duration-300 focus-within:border-slate-300 dark:border-white/10 dark:bg-slate-900/82 dark:shadow-[0_24px_70px_rgba(2,8,23,0.45)] dark:ring-1 dark:ring-white/5 dark:backdrop-blur-xl dark:focus-within:border-sky-400/30">
              <div className="relative px-5 pt-5">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={isSubmitting ? "Generating..." : "Ask LokoAI anything..."}
                  rows={2}
                  className="max-h-60 min-h-[44px] w-full resize-none bg-transparent py-2.5 text-base leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-between px-3 pb-3 pt-2">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center overflow-visible rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-slate-800"
                        aria-label="Add content"
                        title="Add content"
                      >
                        <Plus className="size-5 overflow-visible" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 rounded-[24px] border border-slate-100 bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:border-white/10 dark:bg-slate-900">
                      <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 rounded-[14px] px-3.5 py-3 text-[14.5px] cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800">
                        <Paperclip className="h-4.5 w-4.5 text-slate-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-200">Add files & photos</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 rounded-[14px] px-3.5 py-3 text-[14.5px] cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800">
                        <Package className="h-4.5 w-4.5 text-slate-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-200">Presets</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 rounded-[14px] px-3.5 py-3 text-[14.5px] cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800">
                        <Database className="h-4.5 w-4.5 text-slate-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-200">Professional data</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center justify-between gap-3 rounded-[14px] px-3.5 py-3 text-[14.5px] cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4.5 w-4.5 text-slate-500" />
                          <span className="font-medium text-slate-700 dark:text-slate-200">Web search</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg,.gif,.zip"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className="flex h-10 w-10 items-center justify-center overflow-visible rounded-full text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    aria-label="Voice input"
                    title="Voice input"
                  >
                    <Mic className="size-5 overflow-visible" />
                  </button>

                  <ModelPicker selectedModelId={selectedModelId} onModelChange={setSelectedModelId} />
                </div>

                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={(!prompt.trim() && attachments.length === 0) || isSubmitting}
                  className="flex h-9 w-9 shrink-0 items-center justify-center overflow-visible rounded-xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-20 active:scale-95 dark:bg-sky-500 dark:hover:bg-sky-400"
                  aria-label="Send message"
                >
                  {isSubmitting ? <Loader2 className="size-4 animate-spin overflow-visible" /> : <Send className="size-4 overflow-visible" />}
                </button>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
