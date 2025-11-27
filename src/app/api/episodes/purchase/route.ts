import { NextRequest, NextResponse } from "next/server";
import { purchaseEpisode } from "@/lib/api/cartoon";
import { prisma } from "@/lib/prisma";

/**
 * Unified API endpoint for purchasing episodes (both manga and novel)
 * 
 * Request body:
 * - episodeUuids: string[] (required) - Array of episode UUIDs to purchase
 * OR
 * - cartoonUuid: string, episode: number (legacy support) - Single episode purchase
 * 
 * Returns:
 * - success: boolean
 * - message: string
 * - error?: string (if failed)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { episodeUuids, cartoonUuid, episode, type } = body;

    let episodeUuidsArray: string[];

    // Support both new format (episodeUuids array) and old format (cartoonUuid + episode)
    if (episodeUuids && Array.isArray(episodeUuids)) {
      episodeUuidsArray = episodeUuids;
    } else if (cartoonUuid && episode) {
      // Old format: fetch episode UUID from cartoonUuid and episode number
      const cartoonType = type || "manga"; // Default to manga if type not specified
      
      const episodeRecord = await prisma.mangaEp.findFirst({
        where: {
          cartoon: {
            uuid: cartoonUuid,
            type: cartoonType === "novel" ? "novel" : "manga",
            status: "active",
          },
          epNo: typeof episode === "string" ? parseInt(episode) : episode,
          status: "active",
        },
        select: {
          uuid: true,
        },
      });

      if (!episodeRecord) {
        return NextResponse.json(
          { error: "ไม่พบตอน" },
          { status: 404 }
        );
      }

      episodeUuidsArray = [episodeRecord.uuid];
    } else {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน: ต้องระบุ episodeUuids array หรือ (cartoonUuid และ episode)" },
        { status: 400 }
      );
    }

    // Validate that we have at least one episode UUID
    if (!episodeUuidsArray || episodeUuidsArray.length === 0) {
      return NextResponse.json(
        { error: "ไม่ได้ระบุตอน" },
        { status: 400 }
      );
    }

    // Use the purchaseEpisode function
    const result = await purchaseEpisode(episodeUuidsArray);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `ซื้อตอนสำเร็จ ${episodeUuidsArray.length} ตอน`,
    });
  } catch (error) {
    console.error("Error purchasing episodes:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}

