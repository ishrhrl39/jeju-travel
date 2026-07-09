import Link from "next/link";

export default function NotFound() {
  return (
    <main className="home">
      <div className="home-container">
        <header className="home-hero">
          <h1>일정을 찾을 수 없습니다</h1>
          <p>0710부터 0714까지의 일정만 확인할 수 있습니다.</p>
        </header>
        <Link href="/" className="day-nav-home">
          전체 일정으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
