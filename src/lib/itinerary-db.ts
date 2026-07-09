import { getDb } from "@/lib/db";
import type { DayItinerary, ItineraryItem } from "@/data/itinerary";

type DayRow = {
  slug: string;
  day_number: number;
  title: string;
  subtitle: string;
  accent_color: string;
  accent_gradient: string | null;
  memo_placeholder: string;
};

type ItemRow = {
  id: number;
  day_slug: string;
  sort_order: number;
  time_label: string | null;
  title: string;
  info_lines: string[];
  memo_lines: string[];
};

export type ItineraryItemRecord = ItineraryItem & {
  id: number;
  sortOrder: number;
};

export type DayItineraryInput = {
  title: string;
  subtitle: string;
  accentColor: string;
  accentGradient?: string | null;
  memoPlaceholder: string;
  items: Array<{
    title: string;
    info?: string[];
    memo?: string[];
  }>;
};

export type ItineraryItemInput = {
  title: string;
  info?: string[];
  memo?: string[];
};

function sortOrderToTimeLabel(sortOrder: number) {
  return String(sortOrder);
}

type SqlClient = Awaited<ReturnType<typeof getDb>>;

async function persistItemSortOrders(
  executor: SqlClient,
  daySlug: string,
  orderedItemIds: number[],
) {
  for (const [index, itemId] of orderedItemIds.entries()) {
    await executor`
      UPDATE travel_day_items
      SET sort_order = ${-(index + 1)}, updated_at = NOW()
      WHERE id = ${itemId} AND day_slug = ${daySlug}
    `;
  }

  for (const [index, itemId] of orderedItemIds.entries()) {
    const sortOrder = index + 1;
    await executor`
      UPDATE travel_day_items
      SET
        sort_order = ${sortOrder},
        time_label = ${sortOrderToTimeLabel(sortOrder)},
        updated_at = NOW()
      WHERE id = ${itemId} AND day_slug = ${daySlug}
    `;
  }
}

function mapItem(row: ItemRow): ItineraryItemRecord {
  return {
    id: row.id,
    sortOrder: row.sort_order,
    time: sortOrderToTimeLabel(row.sort_order),
    title: row.title,
    info: row.info_lines.length > 0 ? row.info_lines : undefined,
    memo: row.memo_lines.length > 0 ? row.memo_lines : undefined,
  };
}

function mapDay(day: DayRow, items: ItemRow[]): DayItinerary {
  return {
    slug: day.slug,
    dayNumber: day.day_number,
    title: day.title,
    subtitle: day.subtitle,
    accentColor: day.accent_color,
    accentGradient: day.accent_gradient ?? undefined,
    memoPlaceholder: day.memo_placeholder,
    items: items.map(mapItem),
  };
}

async function getItemRows(daySlug?: string) {
  const sql = await getDb();

  if (daySlug) {
    return sql<ItemRow[]>`
      SELECT id, day_slug, sort_order, time_label, title, info_lines, memo_lines
      FROM travel_day_items
      WHERE day_slug = ${daySlug}
      ORDER BY sort_order ASC
    `;
  }

  return sql<ItemRow[]>`
    SELECT id, day_slug, sort_order, time_label, title, info_lines, memo_lines
    FROM travel_day_items
    ORDER BY day_slug ASC, sort_order ASC
  `;
}

async function getDayRows() {
  const sql = await getDb();
  return sql<DayRow[]>`
    SELECT slug, day_number, title, subtitle, accent_color, accent_gradient, memo_placeholder
    FROM travel_days
    ORDER BY day_number ASC
  `;
}

export async function getAllDaySlugs(): Promise<string[]> {
  const days = await getDayRows();
  return days.map((day) => day.slug);
}

export async function getAllDays(): Promise<DayItinerary[]> {
  const [days, items] = await Promise.all([getDayRows(), getItemRows()]);
  const itemsByDay = new Map<string, ItemRow[]>();

  for (const item of items) {
    const dayItems = itemsByDay.get(item.day_slug) ?? [];
    dayItems.push(item);
    itemsByDay.set(item.day_slug, dayItems);
  }

  return days.map((day) => mapDay(day, itemsByDay.get(day.slug) ?? []));
}

export async function getDayBySlug(slug: string): Promise<DayItinerary | null> {
  const sql = await getDb();
  const days = await sql<DayRow[]>`
    SELECT slug, day_number, title, subtitle, accent_color, accent_gradient, memo_placeholder
    FROM travel_days
    WHERE slug = ${slug}
    LIMIT 1
  `;

  const day = days[0];
  if (!day) {
    return null;
  }

  const items = await getItemRows(slug);
  return mapDay(day, items);
}

export async function saveDayItinerary(
  slug: string,
  input: DayItineraryInput,
): Promise<DayItinerary | null> {
  const sql = await getDb();

  await sql.begin(async (transaction) => {
    await transaction`
      UPDATE travel_days
      SET
        title = ${input.title},
        subtitle = ${input.subtitle},
        accent_color = ${input.accentColor},
        accent_gradient = ${input.accentGradient ?? null},
        memo_placeholder = ${input.memoPlaceholder},
        updated_at = NOW()
      WHERE slug = ${slug}
    `;

    await transaction`
      DELETE FROM travel_day_items
      WHERE day_slug = ${slug}
    `;

    for (const [index, item] of input.items.entries()) {
      const sortOrder = index + 1;
      await transaction`
        INSERT INTO travel_day_items (
          day_slug,
          sort_order,
          time_label,
          title,
          info_lines,
          memo_lines,
          updated_at
        )
        VALUES (
          ${slug},
          ${sortOrder},
          ${sortOrderToTimeLabel(sortOrder)},
          ${item.title},
          ${item.info ?? []},
          ${item.memo ?? []},
          NOW()
        )
      `;
    }
  });

  return getDayBySlug(slug);
}

export async function createDayItem(
  daySlug: string,
  input: ItineraryItemInput,
): Promise<ItineraryItemRecord> {
  const sql = await getDb();
  const rows = await sql<{ max_order: number | null }[]>`
    SELECT MAX(sort_order) AS max_order
    FROM travel_day_items
    WHERE day_slug = ${daySlug}
  `;
  const nextOrder = (rows[0]?.max_order ?? 0) + 1;

  const inserted = await sql<ItemRow[]>`
    INSERT INTO travel_day_items (
      day_slug,
      sort_order,
      time_label,
      title,
      info_lines,
      memo_lines,
      updated_at
    )
    VALUES (
      ${daySlug},
      ${nextOrder},
      ${sortOrderToTimeLabel(nextOrder)},
      ${input.title},
      ${input.info ?? []},
      ${input.memo ?? []},
      NOW()
    )
    RETURNING id, day_slug, sort_order, time_label, title, info_lines, memo_lines
  `;

  return mapItem(inserted[0]);
}

export async function updateDayItem(
  itemId: number,
  input: ItineraryItemInput,
): Promise<ItineraryItemRecord | null> {
  const sql = await getDb();
  const rows = await sql<ItemRow[]>`
    UPDATE travel_day_items
    SET
      time_label = sort_order::text,
      title = ${input.title},
      info_lines = ${input.info ?? []},
      memo_lines = ${input.memo ?? []},
      updated_at = NOW()
    WHERE id = ${itemId}
    RETURNING id, day_slug, sort_order, time_label, title, info_lines, memo_lines
  `;

  const row = rows[0];
  return row ? mapItem(row) : null;
}

export async function deleteDayItem(itemId: number): Promise<boolean> {
  const sql = await getDb();
  const rows = await sql<{ id: number; day_slug: string }[]>`
    DELETE FROM travel_day_items
    WHERE id = ${itemId}
    RETURNING id, day_slug
  `;

  const row = rows[0];
  if (!row) {
    return false;
  }

  await renormalizeDayItemOrder(row.day_slug);
  return true;
}

async function renormalizeDayItemOrder(daySlug: string) {
  const sql = await getDb();
  const items = await sql<{ id: number }[]>`
    SELECT id
    FROM travel_day_items
    WHERE day_slug = ${daySlug}
    ORDER BY sort_order, id
  `;

  await sql.begin(async (transaction) => {
    await persistItemSortOrders(
      transaction as unknown as SqlClient,
      daySlug,
      items.map((item) => item.id),
    );
  });
}

export async function reorderDayItems(
  daySlug: string,
  itemIds: number[],
): Promise<DayItinerary | null> {
  const sql = await getDb();

  await sql.begin(async (transaction) => {
    await persistItemSortOrders(transaction as unknown as SqlClient, daySlug, itemIds);
  });

  return getDayBySlug(daySlug);
}

export async function getDayItem(
  itemId: number,
): Promise<ItineraryItemRecord | null> {
  const sql = await getDb();
  const rows = await sql<ItemRow[]>`
    SELECT id, day_slug, sort_order, time_label, title, info_lines, memo_lines
    FROM travel_day_items
    WHERE id = ${itemId}
    LIMIT 1
  `;

  const row = rows[0];
  return row ? mapItem(row) : null;
}

export async function isValidDayItem(
  daySlug: string,
  itemId: number,
): Promise<boolean> {
  const sql = await getDb();
  const rows = await sql<{ id: number }[]>`
    SELECT id
    FROM travel_day_items
    WHERE id = ${itemId} AND day_slug = ${daySlug}
    LIMIT 1
  `;

  return rows.length > 0;
}

export async function isValidDaySlug(slug: string): Promise<boolean> {
  const sql = await getDb();
  const rows = await sql<{ slug: string }[]>`
    SELECT slug
    FROM travel_days
    WHERE slug = ${slug}
    LIMIT 1
  `;

  return rows.length > 0;
}
