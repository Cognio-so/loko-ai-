"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, DragEvent as ReactDragEvent } from "react";
import {
  OPENROUTER_MODEL_OPTIONS,
  DEFAULT_SELECTED_OPENROUTER_MODEL,
  SELECTED_MODEL_STORAGE_KEY,
  getOpenRouterModelById,
  isSupportedOpenRouterModel,
} from "@/lib/openrouterModels";
import { useAuth } from "@/hooks/useAuth";
import { getAssistant, type CollectionAssistant } from "@/app/collection/collection-data";
import {
  ArrowLeft,
  Bot,
  ChevronDown,
  File,
  FileText,
  Grid3X3,
  Home,
  Library,
  Lightbulb,
  Menu,
  Mic,
  Plus,
  Rocket,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
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
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: assistant.welcome },
  ]);
  const [prompt, setPrompt] = useState("");
  const [selectedModelId, setSelectedModelId] = useState<string>(assistant.modelId || DEFAULT_SELECTED_OPENROUTER_MODEL);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
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

  const selectedModel = getOpenRouterModelById(selectedModelId);

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
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/collection" className="lg:hidden">
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="font-semibold text-slate-900 dark:text-white">{assistant.name}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">{assistant.description}</p>
            </div>
          </div>
        </header>

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
          <div className="mx-auto max-w-2xl">
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
            <div className="relative flex flex-col rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl transition-all focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-50 dark:focus-within:ring-sky-900/50">
              {/* Top Toolbar */}
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 p-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label="Add file"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg,.gif,.zip"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />

                <button
                  onClick={handleVoiceInput}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label="Voice input"
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>

              {/* Main Input Area */}
              <div className="flex items-end gap-3 p-5">
                {/* Model Selector */}
                <div className="relative">
                  <button
                    onClick={() => setIsModelMenuOpen((s) => !s)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition"
                  >
                    <span className="h-6 w-6 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-600 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {selectedModel?.provider?.[0] ?? "A"}
                    </span>
                    <span className="max-w-[140px] truncate text-sm">{selectedModel?.name ?? assistant.model}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </button>

                  {isModelMenuOpen && <ModelSelectorModal selectedModelId={selectedModelId} onSelect={(id) => { setSelectedModelId(id); setIsModelMenuOpen(false); }} onClose={() => setIsModelMenuOpen(false)} />}
                </div>

                {/* Textarea */}
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask LokoAI anything..."
                  rows={2}
                  className="max-h-72 min-h-[72px] flex-1 resize-none bg-transparent py-2 text-base text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />

                {/* Send Button */}
                <button
                  onClick={sendMessage}
                  disabled={!prompt.trim() || isSubmitting}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 disabled:opacity-40 disabled:grayscale"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
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

function ModelSelectorModal({
  selectedModelId,
  onSelect,
  onClose,
}: {
  selectedModelId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<"All" | "Chat" | "Coding" | "Reasoning" | "Search" | "Image" | "Free" | "Paid">("All");

  const tabs = ["All", "Chat", "Coding", "Reasoning", "Search", "Image", "Free", "Paid"] as const;

  const filteredModels = OPENROUTER_MODEL_OPTIONS.filter((model) => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTab === "All") return matchesSearch;
    if (selectedTab === "Chat" && model.type === "Chat") return matchesSearch;
    if (selectedTab === "Coding" && model.type === "Coding") return matchesSearch;
    if (selectedTab === "Reasoning" && model.type === "Reasoning") return matchesSearch;
    if (selectedTab === "Search" && model.categories.includes("Search Models")) return matchesSearch;
    if (selectedTab === "Image" && model.type === "Image") return matchesSearch;
    if (selectedTab === "Free" && model.free) return matchesSearch;
    if (selectedTab === "Paid" && !model.free) return matchesSearch;
    
    return false;
  });

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-4 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Select Model</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="border-b border-slate-100 dark:border-slate-700 p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-50 dark:focus:ring-sky-900/50"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-100 dark:border-slate-700 px-6 pt-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition ${
                  selectedTab === tab
                    ? "bg-sky-500 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Models Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => onSelect(model.id)}
                  className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition ${
                    selectedModelId === model.id
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700"
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {model.provider[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{model.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{model.provider}</p>
                  </div>
                  {selectedModelId === model.id && <div className="h-5 w-5 rounded-full bg-sky-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
