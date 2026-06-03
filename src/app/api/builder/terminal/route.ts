import { NextResponse } from "next/server";
import { runBuilderCommand } from "@/lib/terminalExecutor";

type TerminalRequestBody = {
  command?: string;
  args?: string[];
  cwd?: string;
  timeoutMs?: number;
};

export async function POST(req: Request) {
  if (process.env.BUILDER_TERMINAL_API_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Builder terminal API is disabled." },
      { status: 403 }
    );
  }

  let body: TerminalRequestBody;
  try {
    body = (await req.json()) as TerminalRequestBody;
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
