import { getAllMemos } from "@/lib/memos";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const memos = await getAllMemos();
    return NextResponse.json(memos);
  } catch (error) {
    console.error("Failed to load memos:", error);
    return NextResponse.json(
      { error: "메모 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
