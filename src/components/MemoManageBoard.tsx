"use client";

import TravelMemoEditor from "@/components/TravelMemoEditor";
import type { DayItinerary } from "@/data/itinerary";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function MemoManageBoard() {
  const [days, setDays] = useState<DayItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDays = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/itinerary");

      if (!response.ok) {
        throw new Error("Failed to load days");
      }

      const data = (await response.json()) as DayItinerary[];
      setDays(data);
    } catch {
      setDays([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDays();
  }, [loadDays]);

  if (isLoading) {
    return <p className="manage-status">일정을 불러오는 중...</p>;
  }

  return (
    <main className="home">
      <div className="home-container">
        <header className="home-hero">
          <h1>여행 메모 관리</h1>
          <p>
            7월 10일부터 14일까지 일자별 여행 메모를 한곳에서 확인하고
            수정할 수 있습니다. 변경 내용은 Supabase `travel_memos` 테이블에
            저장됩니다.
          </p>
        </header>

        <div className="memo-board">
          {days.map((day) => (
            <article key={day.slug} className="memo-board-item">
              <div className="memo-board-header">
                <div>
                  <h2>
                    {day.dayNumber}일차 · 7/{day.slug.slice(2)}
                  </h2>
                  <p>{day.subtitle}</p>
                </div>
                <Link href={`/${day.slug}`} className="memo-board-link">
                  일정 보기
                </Link>
              </div>

              <TravelMemoEditor
                daySlug={day.slug}
                dayNumber={day.dayNumber}
                placeholder={day.memoPlaceholder}
                accentColor={day.accentColor}
                autoSave
              />
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
