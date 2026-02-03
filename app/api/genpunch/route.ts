import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { numPunchCards } = await req.json();

    if (!numPunchCards || numPunchCards < 1) {
      return NextResponse.json({ error: "Invalid number of punch cards" }, { status: 400 });
    }

    return NextResponse.json({ message: `Generated ${numPunchCards} punch cards!` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}