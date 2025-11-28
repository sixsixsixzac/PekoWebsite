import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";
import { compressImageFile } from "@/lib/utils/image-compress";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG, JPG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must not exceed 5MB" },
        { status: 400 }
      );
    }

    // Create uploads/avatars directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "avatars");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename (always use .webp for consistency)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `${userId}_${timestamp}_${randomString}.webp`;
    const filepath = join(uploadsDir, filename);

    // Compress and optimize image - convert all formats to WebP
    const compressedBuffer = await compressImageFile(file, {
      width: 400,
      height: 400,
      quality: 80,
      format: "webp",
      fit: "cover",
      position: "center",
    });

    // Save compressed image
    await writeFile(filepath, compressedBuffer);

    // Update user profile with new avatar path
    const avatarPath = `uploads/avatars/${filename}`;
    await prisma.userProfile.update({
      where: { id: userId },
      data: {
        userImg: avatarPath,
      },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: `/uploads/avatars/${filename}`,
      avatarPath,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        ...(process.env.NODE_ENV === "development" && { message: errorMessage }),
      },
      { status: 500 }
    );
  }
}

