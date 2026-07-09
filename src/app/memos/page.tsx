import MemoManageBoard from "@/components/MemoManageBoard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "여행 메모 관리 | 제주 여행 일정표",
  description: "일자별 제주 여행 메모를 확인하고 수정합니다.",
};

export default function MemosPage() {
  return <MemoManageBoard />;
}
