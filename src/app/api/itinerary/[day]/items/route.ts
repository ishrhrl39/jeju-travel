import type { ItineraryItemInput } from "@/lib/itinerary-db";
import {
  createDayItem,
  isValidDaySlug,
} from "@/lib/itinerary-db";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ day: string }>;
};

function parseItemInput(body: unknown): ItineraryItemInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;

  if (typeof record.title !== "string" || !record.title.trim()) {
    return null;
  }

  return {
    title: record.title.trim(),
    info: Array.isArray(record.info)
      ? record.info.filter((line): line is string => typeof line === "string")
      : [],
    memo: Array.isArray(record.memo)
      ? record.memo.filter((line): line is string => typeof line === "string")
      : [],
  };
}

export async function POST(request: Request, context: RouteContext) {
  const { day } = await context.params;

  if (!(await isValidDaySlug(day))) {
    return NextResponse.json({ error: "유효하지 않은 일정입니다." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const input = parseItemInput(body);

    if (!input) {
      return NextResponse.json(
        { error: "요청 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const item = await createDayItem(day, input);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error(`Failed to create item for ${day}:`, error);
    return NextResponse.json(
      { error: "일정 항목을 추가하지 못했습니다." },
      { status: 500 },
    );
  }
}
