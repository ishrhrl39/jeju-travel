import { getAllDays } from "@/lib/itinerary-db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const days = await getAllDays();
    return NextResponse.json(days);
  } catch (error) {
    console.error("Failed to load itinerary:", error);
    return NextResponse.json(
      { error: "일정 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
