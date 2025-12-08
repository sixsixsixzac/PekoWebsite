import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { validateDisplayName } from "@/lib/utils/text-validation";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    
    // Rate limiting: 5 requests per 60 seconds per user
    const rateLimitResult = await rateLimit({
      identifier: `user:${userId}`,
      maxRequests: 5,
      windowSeconds: 60,
      keyPrefix: 'ratelimit:display-name',
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: `กรุณารอ ${rateLimitResult.resetIn} วินาทีก่อนลองอีกครั้ง`,
          retryAfter: rateLimitResult.resetIn,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.resetIn.toString(),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": (Date.now() + rateLimitResult.resetIn * 1000).toString(),
          },
        }
      );
    }
    
    if (isNaN(userId)) {
      console.error("Invalid user ID:", session.user.id);
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { displayName } = body;

    if (!displayName || typeof displayName !== "string") {
      return NextResponse.json(
        { error: "displayName is required" },
        { status: 400 }
      );
    }

    // Validate display name
    const validation = validateDisplayName(displayName);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "Invalid display name" },
        { status: 400 }
      );
    }

    const trimmedDisplayName = displayName.trim();

    // Check if the name matches the current user's display name (case-insensitive)
    const currentUser = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: { displayName: true },
    });

    if (currentUser && currentUser.displayName.toLowerCase() === trimmedDisplayName.toLowerCase()) {
      return NextResponse.json(
        {
          error: "Display name unchanged",
          message: "ชื่อที่แสดงเหมือนเดิม ไม่จำเป็นต้องอัปเดต",
        },
        { status: 400 }
      );
    }

    // Update user profile
    await prisma.userProfile.update({
      where: { id: userId },
      data: {
        displayName: trimmedDisplayName,
      },
    });

    return NextResponse.json({
      success: true,
      displayName: trimmedDisplayName,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    
    // In development, include more error details
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      { 
        error: "Internal server error",
        ...(isDev && {
          message: errorMessage,
          stack: errorStack,
        })
      },
      { status: 500 }
    );
  }
}

export async function GET() {
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
      console.error("Invalid user ID:", session.user.id);
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Fetch user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: {
        displayName: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch episode settings
    const episodeSettings = await prisma.userSettings.findMany({
      where: {
        userId,
        settingKey: {
          in: ["buyImmediately", "loadFullImages"],
        },
      },
      select: {
        settingKey: true,
        settingValue: true,
      },
    });

    // Map settings to object
    const settingsMap = episodeSettings.reduce((acc, setting) => {
      acc[setting.settingKey] = setting.settingValue;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      displayName: userProfile.displayName,
      buyImmediately: settingsMap.buyImmediately === true,
      loadFullImages: settingsMap.loadFullImages === true,
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    
    // In development, include more error details
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      { 
        error: "Internal server error",
        ...(isDev && {
          message: errorMessage,
          stack: errorStack,
        })
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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
      console.error("Invalid user ID:", session.user.id);
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { buyImmediately, loadFullImages } = body;

    // Validate that at least one setting is provided
    if (buyImmediately === undefined && loadFullImages === undefined) {
      return NextResponse.json(
        { error: "At least one setting must be provided" },
        { status: 400 }
      );
    }

    // Update or create settings
    const settingsToUpdate = [
      { key: "buyImmediately", value: buyImmediately },
      { key: "loadFullImages", value: loadFullImages },
    ].filter((setting) => setting.value !== undefined);

    for (const setting of settingsToUpdate) {
      // Check if setting exists
      const existing = await prisma.userSettings.findFirst({
        where: {
          userId,
          settingKey: setting.key,
        },
      });

      if (existing) {
        // Update existing setting
        await prisma.userSettings.update({
          where: { id: existing.id },
          data: {
            settingValue: setting.value,
          },
        });
      } else {
        // Create new setting
        await prisma.userSettings.create({
          data: {
            userId,
            settingKey: setting.key,
            settingValue: setting.value,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      buyImmediately: buyImmediately ?? undefined,
      loadFullImages: loadFullImages ?? undefined,
    });
  } catch (error) {
    console.error("Error updating episode settings:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    
    // In development, include more error details
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      { 
        error: "Internal server error",
        ...(isDev && {
          message: errorMessage,
          stack: errorStack,
        })
      },
      { status: 500 }
    );
  }
}

