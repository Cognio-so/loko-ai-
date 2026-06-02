import { NextResponse } from "next/server";
import { readGeneratedFile } from "@/lib/storage/generated-files";

type DownloadRouteContext = {
  params: Promise<{
    filename: string;
  }>;
};

export async function GET(_request: Request, context: DownloadRouteContext) {
  const { filename } = await context.params;
  const file = await readGeneratedFile(filename);

  if (!file) {
    return NextResponse.json({ error: "File not found or invalid filename." }, { status: 404 });
  }

  return new Response(file.data, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(file.size),
      "Content-Disposition": `attachment; filename="${file.fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
