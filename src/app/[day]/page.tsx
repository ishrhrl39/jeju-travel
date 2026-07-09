import ItineraryDay from "@/components/ItineraryDay";
import { FALLBACK_DAY_SLUGS } from "@/data/itinerary";
import { getAllDaySlugs, getAllDays, getDayBySlug } from "@/lib/itinerary-db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ day: string }>;
};

export async function generateStaticParams() {
  try {
    const slugs = await getAllDaySlugs();
    return slugs.map((day) => ({ day }));
  } catch {
    return FALLBACK_DAY_SLUGS.map((day) => ({ day }));
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { day: slug } = await params;

  try {
    const day = await getDayBySlug(slug);

    if (!day) {
      return { title: "일정을 찾을 수 없습니다" };
    }

    return {
      title: `${day.title} | 제주 여행 일정표`,
      description: day.subtitle,
    };
  } catch {
    return { title: "일정을 찾을 수 없습니다" };
  }
}

export default async function DayPage({ params }: PageProps) {
  const { day: slug } = await params;
  const [day, allDays] = await Promise.all([getDayBySlug(slug), getAllDays()]);

  if (!day) {
    notFound();
  }

  return <ItineraryDay day={day} allDays={allDays} />;
}
