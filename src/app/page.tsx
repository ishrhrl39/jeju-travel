import HomeDayList from "@/components/HomeDayList";
import { getAllDays } from "@/lib/itinerary-db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const days = await getAllDays();

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

        <HomeDayList days={days} />
      </div>
    </main>
  );
}
