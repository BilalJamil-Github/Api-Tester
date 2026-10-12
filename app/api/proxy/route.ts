import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { method, url, headersText, bodyText } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const targetMethod = (method || "GET").toUpperCase();

    let targetHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (headersText) {
      targetHeaders =
        typeof headersText === "string" ? JSON.parse(headersText) : headersText;
    }

    let targetBody: string | undefined;

    if (
      !["GET", "DELETE", "HEAD"].includes(targetMethod) &&
      bodyText !== undefined &&
      bodyText !== ""
    ) {
      targetBody =
        typeof bodyText === "string" ? bodyText : JSON.stringify(bodyText);
    }

    const res = await fetch(url, {
      method: targetMethod,
      headers: targetHeaders,
      body: targetBody,
    });

    const responseText = await res.text();

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { message: responseText };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    const cause = error?.cause?.code || error?.code;

    if (
      cause === "ENOTFOUND" ||
      cause === "ECONNREFUSED" ||
      error.message?.includes("fetch failed")
    ) {
      return NextResponse.json(
        { error: "Could not connect to the destination server." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}