import { NextResponse } from "next/server";
import { runBuilderCommand } from "@/lib/terminalExecutor";
import { guarded, preflightResponse, readJsonBody } from "@/lib/security";

type TerminalRequestBody = {
  command?: string;
  args?: string[];
  cwd?: string;
  timeoutMs?: number;
};

async function handlePost(req: Request) {
  if (process.env.BUILDER_TERMINAL_API_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Builder terminal API is disabled." },
      { status: 403 }
    );
  }

  let body: TerminalRequestBody;
  try {
    body = await readJsonBody<TerminalRequestBody>(req, 100_000);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.command) {
    return NextResponse.json({ error: "Command is required." }, { status: 400 });
  }

  try {
    const result = await runBuilderCommand({
      command: body.command,
      args: body.args,
      cwd: body.cwd,
      timeoutMs: body.timeoutMs,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Command failed." },
      { status: 400 }
    );
  }
}

export const POST = guarded(handlePost, 5);
export const OPTIONS = preflightResponse;
