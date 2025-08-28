import { NextResponse } from "next/server";
import prisma  from "@/prisma/client";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_API_KEY,
});

export async function DELETE(req: Request) {
  try {
    const { publicId } = await req.json();

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });

    // Delete from DB
    await prisma.video.delete({
      where: { publicId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
