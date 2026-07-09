INSERT INTO travel_days (
  slug,
  day_number,
  title,
  subtitle,
  accent_color,
  accent_gradient,
  memo_placeholder
)
VALUES
  ('0710', 1, '✈ 제주 여행 일정', '2026년 7월 10일 (금) · 제주 도착 08:00', '#4F7DF3', NULL, '여행 중 메모를 작성하세요.'),
  ('0711', 2, '🌴 제주 여행 2일차', '2026년 7월 11일 (토)', '#1F9D8B', NULL, '오늘의 여행 메모를 작성하세요.'),
  ('0712', 3, '🌺 제주 여행 3일차', '2026년 7월 12일 (일)', '#FF7043', 'linear-gradient(135deg, #FF8A65, #FF7043)', '여행 메모를 입력하세요.'),
  ('0713', 4, '✈ 제주 여행 4일차', '2026년 7월 13일 (월)', '#3F51B5', 'linear-gradient(135deg, #3F51B5, #5C6BC0)', '오늘의 여행 메모를 작성하세요.'),
  ('0714', 5, '🌲 제주 여행 5일차', '2026년 7월 14일 (화)', '#43A047', 'linear-gradient(135deg, #2E7D32, #43A047)', '여행 메모를 작성하세요.')
ON CONFLICT (slug) DO UPDATE SET
  day_number = EXCLUDED.day_number,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  accent_color = EXCLUDED.accent_color,
  accent_gradient = EXCLUDED.accent_gradient,
  memo_placeholder = EXCLUDED.memo_placeholder,
  updated_at = NOW();

DELETE FROM travel_day_items
WHERE day_slug IN ('0710', '0711', '0712', '0713', '0714');

INSERT INTO travel_day_items (day_slug, sort_order, time_label, title, info_lines, memo_lines)
VALUES
  ('0710', 1, '1', '렌트카 수령', ARRAY['🚗 공항 도착 후 렌터카 인수'], ARRAY[]::TEXT[]),
  ('0710', 2, '2', '풍어횟집 (한치회)', ARRAY['📍 제주특별자치도 제주시 일주동로 55'], ARRAY['한치회 맛집']),
  ('0710', 3, '3', '제주 유리네식당', ARRAY['📍 제주시 연북로 146'], ARRAY['✔ 갈치구이', '✔ 성게미역국', '✔ 보말국', '✔ 고등어구이']),
  ('0710', 4, '4', '만장굴', ARRAY[]::TEXT[], ARRAY['수건을 챙기기']),
  ('0710', 5, '5', '각지해수욕장', ARRAY[]::TEXT[], ARRAY['관광 및 휴식']),

  ('0711', 1, '1', '미네이네정원', ARRAY['📍 제주특별자치도 제주시 한경면 큰엉해안 17'], ARRAY[]::TEXT[]),
  ('0711', 2, '2', '비체올린', ARRAY['📍 제주특별자치도 제주시 한경면 판조로 253-6'], ARRAY[]::TEXT[]),
  ('0711', 3, '3', '판포포구', ARRAY['📍 제주특별자치도 제주시 한경면 판포리 2877-3'], ARRAY[]::TEXT[]),

  ('0712', 1, '1', '🌊 엉또폭포', ARRAY['📍 제주특별자치도 서귀포시 강정동'], ARRAY[]::TEXT[]),
  ('0712', 2, '2', '🌸 휴애리 자연생활공원', ARRAY['📍 제주특별자치도 서귀포시 남원읍 신례동로 256'], ARRAY['수국축제 관람']),
  ('0712', 3, '3', '🏊 논짓물 담수풀장', ARRAY['오전 10시부터 무료', '📍 제주특별자치도 서귀포시 예래해안로 256'], ARRAY['천연 담수풀장']),
  ('0712', 4, '4', '🎉 공항 근처 축제', ARRAY['오후 1시 ~ 4시'], ARRAY['• 건춘고기집 방문', '• 공룡해수욕장']),

  ('0713', 1, '1', '📍 묵연 바다은숙', ARRAY['제주특별자치도 서귀포시 남원읍 수망리 산 188'], ARRAY[]::TEXT[]),
  ('0713', 2, '2', '🌄 성산일출봉 또는 우도', ARRAY[]::TEXT[], ARRAY['여행 상황과 날씨에 따라 선택']),

  ('0714', 1, '1', '🌳 사려니숲길', ARRAY['제주를 대표하는 삼나무 숲길 산책'], ARRAY[]::TEXT[]);

INSERT INTO travel_memos (day_slug, content, updated_at)
VALUES
  ('0710', '', NOW()),
  ('0711', '', NOW()),
  ('0712', '', NOW()),
  ('0713', '', NOW()),
  ('0714', '', NOW())
ON CONFLICT (day_slug) DO NOTHING;
