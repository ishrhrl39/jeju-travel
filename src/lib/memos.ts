import { getDb } from "@/lib/db";
import { getAllDays } from "@/lib/itinerary-db";

export type TravelMemo = {
  daySlug: string;
  content: string;
  updatedAt: string;
};

export type TravelMemoSummary = TravelMemo & {
  dayNumber: number;
  subtitle: string;
};

export async function getAllMemos(): Promise<TravelMemoSummary[]> {
  const sql = await getDb();
  const days = await getAllDays();
  const rows = await sql<{ day_slug: string; content: string; updated_at: Date }[]>`
    SELECT day_slug, content, updated_at
    FROM travel_memos
    ORDER BY day_slug ASC
  `;

  const memoMap = new Map(
    rows.map((row) => [
      row.day_slug,
      {
        daySlug: row.day_slug,
        content: row.content,
        updatedAt: row.updated_at.toISOString(),
      },
    ]),
  );

  return days.map((day) => {
    const memo = memoMap.get(day.slug);

    return {
      daySlug: day.slug,
      dayNumber: day.dayNumber,
      subtitle: day.subtitle,
      content: memo?.content ?? "",
      updatedAt: memo?.updatedAt ?? "",
    };
  });
}

export async function getMemo(daySlug: string): Promise<TravelMemo | null> {
  const sql = await getDb();
  const rows = await sql<{ day_slug: string; content: string; updated_at: Date }[]>`
    SELECT day_slug, content, updated_at
    FROM travel_memos
    WHERE day_slug = ${daySlug}
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    daySlug: row.day_slug,
    content: row.content,
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function saveMemo(daySlug: string, content: string): Promise<TravelMemo> {
  const sql = await getDb();
  const rows = await sql<{ day_slug: string; content: string; updated_at: Date }[]>`
    INSERT INTO travel_memos (day_slug, content, updated_at)
    VALUES (${daySlug}, ${content}, NOW())
    ON CONFLICT (day_slug)
    DO UPDATE SET
      content = EXCLUDED.content,
      updated_at = NOW()
    RETURNING day_slug, content, updated_at
  `;

  const row = rows[0];

  return {
    daySlug: row.day_slug,
    content: row.content,
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function deleteMemo(daySlug: string): Promise<void> {
  const sql = await getDb();
  await sql`
    DELETE FROM travel_memos
    WHERE day_slug = ${daySlug}
  `;
}
