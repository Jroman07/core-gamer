import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackRequestSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = trackRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { gameName, genre, url } = parsed.data;

    const click = await prisma.gameClick.create({
      data: { gameName, genre, url: url || null },
    });

    return NextResponse.json({ success: true, click });
  } catch (error) {
    console.error("Error tracking click:", error);
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 });
  }
}
