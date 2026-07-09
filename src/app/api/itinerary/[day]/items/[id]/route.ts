import type { ItineraryItemInput } from "@/lib/itinerary-db";
import {
  deleteDayItem,
  isValidDayItem,
  isValidDaySlug,
  updateDayItem,
} from "@/lib/itinerary-db";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ day: string; id: string }>;
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

function parseItemId(id: string) {
  const itemId = Number(id);
  return Number.isInteger(itemId) && itemId > 0 ? itemId : null;
}

export async function PUT(request: Request, context: RouteContext) {
  const { day, id } = await context.params;
  const itemId = parseItemId(id);

  if (!itemId || !(await isValidDaySlug(day))) {
    return NextResponse.json({ error: "유효하지 않은 일정입니다." }, { status: 404 });
  }

  if (!(await isValidDayItem(day, itemId))) {
    return NextResponse.json({ error: "일정 항목을 찾을 수 없습니다." }, { status: 404 });
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

    const item = await updateDayItem(itemId, input);

    if (!item) {
      return NextResponse.json({ error: "일정 항목을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error(`Failed to update item ${itemId}:`, error);
    return NextResponse.json(
      { error: "일정 항목을 수정하지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { day, id } = await context.params;
  const itemId = parseItemId(id);

  if (!itemId || !(await isValidDaySlug(day))) {
    return NextResponse.json({ error: "유효하지 않은 일정입니다." }, { status: 404 });
  }

  if (!(await isValidDayItem(day, itemId))) {
    return NextResponse.json({ error: "일정 항목을 찾을 수 없습니다." }, { status: 404 });
  }

  try {
    const deleted = await deleteDayItem(itemId);

    if (!deleted) {
      return NextResponse.json({ error: "일정 항목을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ id: itemId });
  } catch (error) {
    console.error(`Failed to delete item ${itemId}:`, error);
    return NextResponse.json(
      { error: "일정 항목을 삭제하지 못했습니다." },
      { status: 500 },
    );
  }
}
