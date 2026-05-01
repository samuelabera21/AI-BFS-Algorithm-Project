import { NextResponse } from "next/server";

import { getBackendAnalysis } from "@/lib/backend";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = (body.password ?? "").trim();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const analysis = await getBackendAnalysis(password);
    return NextResponse.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
