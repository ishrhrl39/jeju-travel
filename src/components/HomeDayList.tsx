import type { DayItinerary } from "@/data/itinerary";
import Link from "next/link";

type HomeDayListProps = {
  days: DayItinerary[];
};

export default function HomeDayList({ days }: HomeDayListProps) {
  return (
    <div className="day-list">
      {days.map((day) => (
        <Link key={day.slug} href={`/${day.slug}`} className="day-card">
          <h2>
            {day.dayNumber}일차 · 7/{day.slug.slice(2)}
          </h2>
          <p>{day.subtitle}</p>
        </Link>
      ))}
    </div>
  );
}
