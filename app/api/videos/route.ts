

import { NextRequest, NextResponse } from "next/server";
import prisma  from "@/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Fetch failed:", error);
    return NextResponse.json({ error: "error fetching videos" }, { status: 500 });
  }
}
