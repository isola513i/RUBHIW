import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production" && process.env.GOOGLE_OAUTH_CALLBACK_ENABLED !== "true") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return new NextResponse(
      `<main style="font-family: sans-serif; padding: 24px;"><h1>Google OAuth failed</h1><p>${escapeHtml(error)}</p></main>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 400 },
    );
  }

  if (!code) {
    return new NextResponse(
      `<main style="font-family: sans-serif; padding: 24px;"><h1>No authorization code</h1><p>Please start from npm run google:oauth:url.</p></main>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 400 },
    );
  }

  return new NextResponse(
    `<main style="font-family: sans-serif; padding: 24px; line-height: 1.6;">
      <h1>Google OAuth code</h1>
      <p>Run this command in the project terminal:</p>
      <pre style="white-space: pre-wrap; padding: 16px; background: #f6f6f6; border-radius: 12px;">npm run google:oauth:token -- ${escapeHtml(code)}</pre>
    </main>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
