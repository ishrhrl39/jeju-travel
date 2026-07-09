import { isValidDaySlug } from "@/lib/itinerary-db";
import { deleteMemo, getMemo, saveMemo } from "@/lib/memos";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ day: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { day } = await context.params;

  if (!(await isValidDaySlug(day))) {
    return NextResponse.json({ error: "유효하지 않은 일정입니다." }, { status: 404 });
  }

  try {
    const memo = await getMemo(day);

    return NextResponse.json({
      daySlug: day,
      content: memo?.content ?? "",
      updatedAt: memo?.updatedAt ?? null,
    });
  } catch (error) {
    console.error(`Failed to load memo for ${day}:`, error);
    return NextResponse.json(
      { error: "메모를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { day } = await context.params;

  if (!(await isValidDaySlug(day))) {
    return NextResponse.json({ error: "유효하지 않은 일정입니다." }, { status: 404 });
  }

  try {
    const body = (await request.json()) as { content?: unknown };

    if (typeof body.content !== "string") {
      return NextResponse.json(
        { error: "content 필드는 문자열이어야 합니다." },
        { status: 400 },
      );
    }

    const memo = await saveMemo(day, body.content);

    return NextResponse.json(memo);
  } catch (error) {
    console.error(`Failed to save memo for ${day}:`, error);
    return NextResponse.json(
      { error: "메모를 저장하지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { day } = await context.params;

  if (!(await isValidDaySlug(day))) {
    return NextResponse.json({ error: "유효하지 않은 일정입니다." }, { status: 404 });
  }

  try {
    await deleteMemo(day);
    return NextResponse.json({ daySlug: day, content: "", updatedAt: null });
  } catch (error) {
    console.error(`Failed to delete memo for ${day}:`, error);
    return NextResponse.json(
      { error: "메모를 삭제하지 못했습니다." },
      { status: 500 },
    );
  }
}
