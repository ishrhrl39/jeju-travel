import type { DayItineraryInput } from "@/lib/itinerary-db";
import {
  getDayBySlug,
  isValidDaySlug,
  saveDayItinerary,
} from "@/lib/itinerary-db";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ day: string }>;
};

function parseDayInput(body: unknown): DayItineraryInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const value = body as Record<string, unknown>;

  if (
    typeof value.title !== "string" ||
    typeof value.subtitle !== "string" ||
    typeof value.accentColor !== "string" ||
    typeof value.memoPlaceholder !== "string" ||
    !Array.isArray(value.items)
  ) {
    return null;
  }

  const items = value.items.map((item) => {
    if (!item || typeof item !== "object") {
      return null;
    }

    const record = item as Record<string, unknown>;

    if (typeof record.title !== "string") {
      return null;
    }

    return {
      title: record.title,
      info: Array.isArray(record.info)
        ? record.info.filter((line): line is string => typeof line === "string")
        : [],
      memo: Array.isArray(record.memo)
        ? record.memo.filter((line): line is string => typeof line === "string")
        : [],
    };
  });

  if (items.some((item) => item === null)) {
    return null;
  }

  return {
    title: value.title,
    subtitle: value.subtitle,
    accentColor: value.accentColor,
    accentGradient:
      typeof value.accentGradient === "string" ? value.accentGradient : null,
    memoPlaceholder: value.memoPlaceholder,
    items: items as DayItineraryInput["items"],
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { day } = await context.params;

  if (!(await isValidDaySlug(day))) {
    return NextResponse.json({ error: "유효하지 않은 일정입니다." }, { status: 404 });
  }

  try {
    const itinerary = await getDayBySlug(day);

    if (!itinerary) {
      return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error(`Failed to load itinerary for ${day}:`, error);
    return NextResponse.json(
      { error: "일정을 불러오지 못했습니다." },
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
    const body = await request.json();
    const input = parseDayInput(body);

    if (!input) {
      return NextResponse.json(
        { error: "요청 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const itinerary = await saveDayItinerary(day, input);

    if (!itinerary) {
      return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error(`Failed to save itinerary for ${day}:`, error);
    return NextResponse.json(
      { error: "일정을 저장하지 못했습니다." },
      { status: 500 },
    );
  }
}
