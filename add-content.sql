-- ============================================================
--  내용 채우기 — Supabase SQL Editor 에 붙여넣고 Run
--
--  어드민(/admin)에서 해도 되는 일입니다. 다만 배포 주소를 아직
--  모르는 상태라 여기서 한 번에 넣습니다. 다음부터는 어드민을 쓰세요.
--
--  여러 번 실행해도 작업물이 중복으로 쌓이지 않게 짰습니다.
-- ============================================================


-- ── 1. 프로필에 외부 링크 넣기 ──────────────────────────────

update public.profile
set links = '[
  {"label": "인스타그램", "url": "https://www.instagram.com/imagine_imotion/"},
  {"label": "비메오",     "url": "https://vimeo.com/user82831253"}
]'::jsonb,
    updated_at = now()
where id = 1;


-- ── 2. 작업물 넣기 ──────────────────────────────────────────
--  비메오 썸네일은 주소 끝의 크기(_1280x720)만 바꾸면 해상도가 바뀝니다.

insert into public.works (title, summary, image_url, link_url, sort_order, is_visible)
select
  '[Com2us] 크로니클 분노의 드래곤나라카',
  '2024 · 모션그래픽 · 게임 사전예약 영상',
  'https://i.vimeocdn.com/video/1786995948-4f86f8b97623830162510fc90a77ea06490af2dec97a3ff08dfa833d7edb7ded-d_1280x720?region=us',
  'https://vimeo.com/905631051',
  1,
  true
where not exists (
  select 1 from public.works where link_url = 'https://vimeo.com/905631051'
);


-- ── 3. 확인 ────────────────────────────────────────────────

select sort_order, is_visible, title, link_url
from public.works
order by sort_order;

select name, role, email, links from public.profile where id = 1;


-- ============================================================
--  작업물을 더 넣으려면
--
--  이제부터는 어드민이 훨씬 편합니다.
--    배포주소/admin  →  작업물 탭  →  + 새 작업물
--
--  비메오 썸네일 주소를 얻는 법:
--    1. 영상의 공개 주소를 확인합니다 (vimeo.com/숫자 형태)
--       ※ vimeo.com/manage/videos/숫자 는 나만 볼 수 있는 관리 주소입니다
--    2. 아래 주소를 브라우저에 넣으면 thumbnail_url 이 나옵니다
--       https://vimeo.com/api/oembed.json?url=https://vimeo.com/숫자
--    3. 그 주소 끝의 _295x166 을 _1280x720 으로 바꾸면 큰 썸네일이 됩니다
--
--  귀찮으면 영상 주소만 저한테 주세요. 제가 뽑아드리겠습니다.
-- ============================================================
