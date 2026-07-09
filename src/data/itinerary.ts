export type ItineraryItem = {
  time?: string;
  title: string;
  info?: string[];
  memo?: string[];
};

export type DayItinerary = {
  slug: string;
  dayNumber: number;
  title: string;
  subtitle: string;
  accentColor: string;
  accentGradient?: string;
  memoPlaceholder: string;
  items: ItineraryItem[];
};

export const DAYS: DayItinerary[] = [
  {
    slug: "0710",
    dayNumber: 1,
    title: "✈ 제주 여행 일정",
    subtitle: "2026년 7월 10일 (금) · 제주 도착 08:00",
    accentColor: "#4F7DF3",
    memoPlaceholder: "여행 중 메모를 작성하세요.",
    items: [
      {
        time: "①",
        title: "렌트카 수령",
        info: ["🚗 공항 도착 후 렌터카 인수"],
      },
      {
        time: "②",
        title: "풍어횟집 (한치회)",
        info: ["📍 제주특별자치도 제주시 일주동로 55"],
        memo: ["한치회 맛집"],
      },
      {
        time: "③",
        title: "제주 유리네식당",
        info: ["📍 제주시 연북로 146"],
        memo: ["✔ 갈치구이", "✔ 성게미역국", "✔ 보말국", "✔ 고등어구이"],
      },
      {
        time: "④",
        title: "만장굴",
        memo: ["수건을 챙기기"],
      },
      {
        time: "⑤",
        title: "각지해수욕장",
        memo: ["관광 및 휴식"],
      },
    ],
  },
  {
    slug: "0711",
    dayNumber: 2,
    title: "🌴 제주 여행 2일차",
    subtitle: "2026년 7월 11일 (토)",
    accentColor: "#1F9D8B",
    memoPlaceholder: "오늘의 여행 메모를 작성하세요.",
    items: [
      {
        time: "🕚 11:00 ~ 19:30",
        title: "미네이네정원",
        info: ["📍 제주특별자치도 제주시 한경면 큰엉해안 17"],
      },
      {
        title: "비체올린",
        info: ["📍 제주특별자치도 제주시 한경면 판조로 253-6"],
      },
      {
        title: "판포포구",
        info: ["📍 제주특별자치도 제주시 한경면 판포리 2877-3"],
      },
    ],
  },
  {
    slug: "0712",
    dayNumber: 3,
    title: "🌺 제주 여행 3일차",
    subtitle: "2026년 7월 12일 (일)",
    accentColor: "#FF7043",
    accentGradient: "linear-gradient(135deg, #FF8A65, #FF7043)",
    memoPlaceholder: "여행 메모를 입력하세요.",
    items: [
      {
        title: "🌊 엉또폭포",
        info: ["📍 제주특별자치도 서귀포시 강정동"],
      },
      {
        title: "🌸 휴애리 자연생활공원",
        info: ["📍 제주특별자치도 서귀포시 남원읍 신례동로 256"],
        memo: ["수국축제 관람"],
      },
      {
        time: "오전 10시부터 무료",
        title: "🏊 논짓물 담수풀장",
        info: ["📍 제주특별자치도 서귀포시 예래해안로 256"],
        memo: ["천연 담수풀장"],
      },
      {
        time: "오후 1시 ~ 4시",
        title: "🎉 공항 근처 축제",
        memo: ["• 건춘고기집 방문", "• 공룡해수욕장"],
      },
    ],
  },
  {
    slug: "0713",
    dayNumber: 4,
    title: "✈ 제주 여행 4일차",
    subtitle: "2026년 7월 13일 (월)",
    accentColor: "#3F51B5",
    accentGradient: "linear-gradient(135deg, #3F51B5, #5C6BC0)",
    memoPlaceholder: "오늘의 여행 메모를 작성하세요.",
    items: [
      {
        title: "📍 묵연 바다은숙",
        info: ["제주특별자치도 서귀포시 남원읍 수망리 산 188"],
      },
      {
        title: "🌄 성산일출봉 또는 우도",
        memo: ["여행 상황과 날씨에 따라 선택"],
      },
    ],
  },
  {
    slug: "0714",
    dayNumber: 5,
    title: "🌲 제주 여행 5일차",
    subtitle: "2026년 7월 14일 (화)",
    accentColor: "#43A047",
    accentGradient: "linear-gradient(135deg, #2E7D32, #43A047)",
    memoPlaceholder: "여행 메모를 작성하세요.",
    items: [
      {
        title: "🌳 사려니숲길",
        info: ["제주를 대표하는 삼나무 숲길 산책"],
      },
    ],
  },
];

export function getDayBySlug(slug: string): DayItinerary | undefined {
  return DAYS.find((day) => day.slug === slug);
}

export function getAdjacentDays(slug: string) {
  const index = DAYS.findIndex((day) => day.slug === slug);
  return {
    prev: index > 0 ? DAYS[index - 1] : null,
    next: index < DAYS.length - 1 ? DAYS[index + 1] : null,
  };
}
