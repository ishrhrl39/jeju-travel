import { DAYS } from "@/data/itinerary";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home">
      <div className="home-container">
        <header className="home-hero">
          <h1>제주 여행 일정표</h1>
          <p>
            2026년 7월 10일(금)부터 7월 14일(화)까지, 5일간의 제주 여행
            일정입니다. 아래에서 날짜별 일정을 순서대로 확인하세요.
          </p>
        </header>

        <div className="day-list">
          {DAYS.map((day) => (
            <Link key={day.slug} href={`/${day.slug}`} className="day-card">
              <div className="day-card-content">
                <h2>
                  {day.dayNumber}일차 · 7/{day.slug.slice(2)}
                </h2>
                <p>{day.subtitle}</p>
              </div>
              <div
                className="day-card-badge"
                style={{
                  background: day.accentGradient ?? day.accentColor,
                }}
              >
                {day.slug}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
