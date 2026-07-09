"use client";

import DayNavigation from "@/components/DayNavigation";
import type { DayItinerary } from "@/data/itinerary";
import { getAdjacentDays } from "@/data/itinerary";
import { useEffect, useState } from "react";

type ItineraryDayProps = {
  day: DayItinerary;
};

export default function ItineraryDay({ day }: ItineraryDayProps) {
  const { prev, next } = getAdjacentDays(day.slug);
  const storageKey = `jeju-travel-memo-${day.slug}`;
  const [memo, setMemo] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setMemo(saved);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, memo);
  }, [memo, storageKey]);

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

        <div className="timeline">
          {day.items.map((item, index) => (
            <article key={`${item.title}-${index}`} className="item">
              <div className="card">
                {item.time && <div className="time">{item.time}</div>}
                <h2 className="title">{item.title}</h2>

                {item.info && (
                  <div className="info">
                    {item.info.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                )}

                {item.memo && (
                  <div className="memo">
                    {item.memo.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <section className="summary">
          <h2>📝 여행 메모</h2>
          <textarea
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder={day.memoPlaceholder}
            aria-label={`${day.dayNumber}일차 여행 메모`}
          />
        </section>
      </div>
    </div>
  );
}
