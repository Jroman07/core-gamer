import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { gameName, genre, url } = body;

    if (!gameName || !genre) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const click = await prisma.gameClick.create({
      data: {
        gameName,
        genre,
        url: url || null,
      },
    });

    return NextResponse.json({ success: true, click });
  } catch (error) {
    console.error("Error tracking click:", error);
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 });
  }
}
