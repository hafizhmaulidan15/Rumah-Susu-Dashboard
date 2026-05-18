import { NextResponse } from "next/server";

import { GOOGLE_SCRIPT_URL } from "@/lib/googleSheets";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Google Script error: ${response.status} ${errorText}` },
        { status: response.status },
      );
    }

    // Google Apps Script usually returns 200 even for some errors,
    // but here we just pass through the response.
    const data = await response.json();
    return NextResponse.json(data, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("GSheet Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
