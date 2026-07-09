"use client";

import DayNavigation from "@/components/DayNavigation";
import ItineraryItemList from "@/components/ItineraryItemList";
import TravelMemoEditor from "@/components/TravelMemoEditor";
import type { DayItinerary } from "@/data/itinerary";
import { getAdjacentDays } from "@/data/itinerary";

type ItineraryDayProps = {
  day: DayItinerary;
  allDays: DayItinerary[];
};

export default function ItineraryDay({ day, allDays }: ItineraryDayProps) {
  const { prev, next } = getAdjacentDays(allDays, day.slug);

  const headerStyle = day.accentGradient
    ? { background: day.accentGradient }
    : { background: day.accentColor };

  return (
    <div className="page" style={{ "--accent": day.accentColor } as React.CSSProperties}>
      <DayNavigation current={day} prev={prev} next={next} />

      <div className="container">
        <header className="header" style={headerStyle}>
          <h1>{day.title}</h1>
          <p>{day.subtitle}</p>
        </header>

        <ItineraryItemList daySlug={day.slug} initialItems={day.items} />

        <TravelMemoEditor
          daySlug={day.slug}
          dayNumber={day.dayNumber}
          placeholder={day.memoPlaceholder}
          accentColor={day.accentColor}
        />
      </div>
    </div>
  );
}
