import { NextRequest, NextResponse } from "next/server";
import { searchCartoons } from "@/lib/api/search";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "12");

  const result = await searchCartoons({
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    limit: Number.isNaN(limit) || limit < 1 ? 12 : limit,
    // Use broad defaults; can be refined later if needed
    cartoonType: "all",
    complete_status: "all",
    age: "all",
    original: "all",
    mainCategory: "all",
    subCategory: "all",
  });

  return NextResponse.json(result);
}


