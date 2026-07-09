export type ItineraryItem = {
  id?: number;
  sortOrder?: number;
  time?: string;
  title: string;
  info?: string[];
  memo?: string[];
};

export type DayItinerary = {
  slug: string;
  dayNumber: number;
  title: string;
  subtitle: string;
  accentColor: string;
  accentGradient?: string;
  memoPlaceholder: string;
  items: ItineraryItem[];
};

export function getAdjacentDays(days: DayItinerary[], slug: string) {
  const index = days.findIndex((day) => day.slug === slug);

  return {
    prev: index > 0 ? days[index - 1] : null,
    next: index < days.length - 1 ? days[index + 1] : null,
  };
}

export const FALLBACK_DAY_SLUGS = ["0710", "0711", "0712", "0713", "0714"];
