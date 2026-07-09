import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "제주 여행 일정표",
  description: "2026년 7월 10일~14일 제주 여행 일정",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
