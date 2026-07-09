import type { DayItinerary } from "@/data/itinerary";
import Link from "next/link";

type DayNavigationProps = {
  current: DayItinerary;
  prev: DayItinerary | null;
  next: DayItinerary | null;
};

export default function DayNavigation({
  current,
  prev,
  next,
}: DayNavigationProps) {
  return (
    <nav className="day-nav" aria-label="일정 탐색">
      <Link href="/" className="day-nav-home">
        전체 일정
      </Link>

      <div className="day-nav-links">
        {prev ? (
          <Link href={`/${prev.slug}`} className="day-nav-link">
            ← 7/{prev.slug.slice(2)} ({prev.dayNumber}일차)
          </Link>
        ) : (
          <span className="day-nav-link disabled">← 이전 일정 없음</span>
        )}

        <span className="day-nav-current">{current.dayNumber}일차</span>

        {next ? (
          <Link href={`/${next.slug}`} className="day-nav-link">
            7/{next.slug.slice(2)} ({next.dayNumber}일차) →
          </Link>
        ) : (
          <span className="day-nav-link disabled">다음 일정 없음 →</span>
        )}
      </div>
    </nav>
  );
}
