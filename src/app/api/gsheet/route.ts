import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbxRlcAK8NPNNLlMz-qt-kw_Cu4yzJNo2hQjAF_2WZg20nM5H2Nybz3nmoS0wOYIPAaakQ/exec";

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
    return NextResponse.json(data);
  } catch (error) {
    console.error("GSheet Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
