import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUserId = parseInt(session.user.id);
    
    if (isNaN(currentUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { targetUserUuid } = body;

    if (!targetUserUuid || typeof targetUserUuid !== "string") {
      return NextResponse.json(
        { error: "targetUserUuid is required" },
        { status: 400 }
      );
    }

    // Get target user by UUID
    const targetUser = await prisma.userProfile.findFirst({
      where: { uuid: targetUserUuid },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (targetUser.id === currentUserId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.userFollower.findFirst({
      where: {
        followerId: currentUserId,
        followingId: targetUser.id,
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400 }
      );
    }

    // Create follow relationship
    await prisma.userFollower.create({
      data: {
        followerId: currentUserId,
        followingId: targetUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully followed user",
    });
  } catch (error) {
    console.error("Error following user:", error);
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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUserId = parseInt(session.user.id);
    
    if (isNaN(currentUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { targetUserUuid } = body;

    if (!targetUserUuid || typeof targetUserUuid !== "string") {
      return NextResponse.json(
        { error: "targetUserUuid is required" },
        { status: 400 }
      );
    }

    // Get target user by UUID
    const targetUser = await prisma.userProfile.findFirst({
      where: { uuid: targetUserUuid },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete follow relationship
    await prisma.userFollower.deleteMany({
      where: {
        followerId: currentUserId,
        followingId: targetUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully unfollowed user",
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUserId = parseInt(session.user.id);
    
    if (isNaN(currentUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetUserUuid = searchParams.get("targetUserUuid");

    if (!targetUserUuid) {
      return NextResponse.json(
        { error: "targetUserUuid is required" },
        { status: 400 }
      );
    }

    // Get target user by UUID
    const targetUser = await prisma.userProfile.findFirst({
      where: { uuid: targetUserUuid },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if following
    const followRelationship = await prisma.userFollower.findFirst({
      where: {
        followerId: currentUserId,
        followingId: targetUser.id,
      },
    });

    return NextResponse.json({
      isFollowing: !!followRelationship,
    });
  } catch (error) {
    console.error("Error checking follow status:", error);
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

