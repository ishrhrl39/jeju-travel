import ItineraryDay from "@/components/ItineraryDay";
import { DAYS, getDayBySlug } from "@/data/itinerary";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ day: string }>;
};

export function generateStaticParams() {
  return DAYS.map((day) => ({ day: day.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { day: slug } = await params;
  const day = getDayBySlug(slug);

  if (!day) {
    return { title: "일정을 찾을 수 없습니다" };
  }

  return {
    title: `${day.title} | 제주 여행 일정표`,
    description: day.subtitle,
  };
}

export default async function DayPage({ params }: PageProps) {
  const { day: slug } = await params;
  const day = getDayBySlug(slug);

  if (!day) {
    notFound();
  }

  return <ItineraryDay day={day} />;
}
