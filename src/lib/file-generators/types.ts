export const SUPPORTED_FILE_TYPES = ["pdf", "docx", "xlsx", "pptx", "csv", "txt", "md", "json"] as const;

export type GeneratedFileType = (typeof SUPPORTED_FILE_TYPES)[number];

export type FileIntent = {
  isFileRequest: boolean;
  fileType: GeneratedFileType | null;
  category: string;
};

export type FileTable = {
  title: string;
  headers: string[];
  rows: string[][];
};

export type FileSection = {
  heading: string;
  paragraphs: string[];
  bullets: string[];
  table?: FileTable;
};

export type SpreadsheetSheet = {
  name: string;
  headers: string[];
  rows: Array<Array<string | number>>;
};

export type PresentationSlide = {
  title: string;
  bullets: string[];
  speakerNotes?: string;
};

export type StructuredFileContent = {
  title: string;
  subtitle: string;
  summary: string;
  sections: FileSection[];
  tables: FileTable[];
  sheets: SpreadsheetSheet[];
  slides: PresentationSlide[];
  plainText: string;
  metadata: {
    requestedBy: string;
    generatedAt: string;
    category: string;
  };
};

export type StoredGeneratedFile = {
  success: true;
  fileType: GeneratedFileType;
  fileName: string;
  downloadUrl: string;
  title: string;
  size: number;
};
