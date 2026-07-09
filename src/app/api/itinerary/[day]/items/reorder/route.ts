import {
  isValidDaySlug,
  reorderDayItems,
} from "@/lib/itinerary-db";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ day: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { day } = await context.params;

  if (!(await isValidDaySlug(day))) {
    return NextResponse.json({ error: "유효하지 않은 일정입니다." }, { status: 404 });
  }

  try {
    const body = (await request.json()) as { itemIds?: unknown };
    const itemIds = body.itemIds;

    if (
      !Array.isArray(itemIds) ||
      itemIds.some((id) => typeof id !== "number")
    ) {
      return NextResponse.json(
        { error: "itemIds 배열이 필요합니다." },
        { status: 400 },
      );
    }

    const itinerary = await reorderDayItems(day, itemIds);

    if (!itinerary) {
      return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error(`Failed to reorder items for ${day}:`, error);
    return NextResponse.json(
      { error: "일정 순서를 저장하지 못했습니다." },
      { status: 500 },
    );
  }
}
