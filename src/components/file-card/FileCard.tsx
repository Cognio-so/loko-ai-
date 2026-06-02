"use client";

import { Download, FileJson, FileSpreadsheet, FileText, Presentation, ScrollText } from "lucide-react";

export type FileCardData = {
  success: true;
  fileType: "pdf" | "docx" | "xlsx" | "pptx" | "csv" | "txt" | "md" | "json";
  fileName: string;
  downloadUrl: string;
  title: string;
  size: number;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getIcon(fileType: FileCardData["fileType"]) {
  if (fileType === "xlsx" || fileType === "csv") return FileSpreadsheet;
  if (fileType === "pptx") return Presentation;
  if (fileType === "json") return FileJson;
  if (fileType === "pdf") return ScrollText;
  return FileText;
}

function getAccent(fileType: FileCardData["fileType"]) {
  if (fileType === "pdf") return "from-rose-500 to-red-500";
  if (fileType === "xlsx" || fileType === "csv") return "from-emerald-500 to-teal-500";
  if (fileType === "pptx") return "from-orange-500 to-amber-500";
  if (fileType === "json") return "from-violet-500 to-fuchsia-500";
  return "from-sky-500 to-cyan-500";
}

export function FileCard({ file }: { file: FileCardData }) {
  const Icon = getIcon(file.fileType);

  return (
    <div className="my-4 flex max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAccent(file.fileType)} text-white shadow-sm`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-950">{file.title || file.fileName}</p>
        <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
          {file.fileType.toUpperCase()} · {formatBytes(file.size)} · {file.fileName}
        </p>
      </div>
      <a
        href={file.downloadUrl}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-sky-600"
        download
      >
        <Download className="h-4 w-4" />
        Download
      </a>
    </div>
  );
}
