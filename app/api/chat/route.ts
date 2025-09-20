import { NextResponse } from "next/server";

const FLASK_BASE_URL = "http://127.0.0.1:5000";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing 'message'" }, { status: 400 });
    }

    const flaskBody = {
      prompt: message,
    };

    const r = await fetch(`${FLASK_BASE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flaskBody),
    });

    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json({ error: `Flask error: ${r.status} ${text}` }, { status: 502 });
    }

    const data = await r.json();

    return NextResponse.json({ reply: data.completion || data.text || "(no reply)" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}