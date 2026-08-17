-- ============================================================
--  Supabase 준비 — 이 파일 전체를 복사해서 한 번만 실행하세요.
--
--  Supabase 대시보드 → 왼쪽 메뉴 "SQL Editor" → "New query"
--  → 아래 내용을 통째로 붙여넣고 → Run
--
--  이미 한 번 실행했더라도 다시 실행해도 됩니다. (덮어써도 안전하게 짰습니다)
-- ============================================================


-- ============================================================
--  1. 작업물 표
-- ============================================================

create table if not exists public.works (
  id          bigint generated always as identity primary key,
  title       text    not null,              -- 작업물 제목
  summary     text,                          -- 한 줄 설명 (역할·연도까지 여기)
  image_url   text,                          -- 썸네일 이미지 주소
  link_url    text,                          -- 상세를 볼 외부 주소
  sort_order  integer not null default 0,    -- 숫자가 작을수록 위로
  is_visible  boolean not null default true, -- 끄면 사이트에서만 사라짐
  created_at  timestamptz not null default now()
);

-- 예전 버전으로 이미 만들었다면 빠진 칸만 채웁니다
alter table public.works add column if not exists is_visible boolean not null default true;

create index if not exists works_sort_order_idx on public.works (sort_order asc);


-- ============================================================
--  2. 프로필 표 — 한 줄만 존재합니다
-- ============================================================

create table if not exists public.profile (
  id         smallint primary key default 1,
  name       text,
  role       text,
  intro      text,
  email      text,
  links      jsonb not null default '[]'::jsonb,   -- [{ "label": "...", "url": "..." }]
  updated_at timestamptz not null default now(),
  constraint profile_single_row check (id = 1)
);

-- 첫 줄 넣기 (이미 있으면 건드리지 않습니다)
insert into public.profile (id, name, role, intro, email, links)
values (
  1,
  '이광복',
  '영상 디자이너',
  '브랜드의 메시지를 움직임으로 옮깁니다. 광고, 뮤직비디오, 모션그래픽 작업을 해왔습니다.',
  'xox8121@gmail.com',
  '[]'::jsonb
)
on conflict (id) do nothing;


-- ============================================================
--  3. 보안 설정 (RLS) — 가장 중요합니다
--
--  · 손님(anon)      = 사이트 방문자. 읽기만, 그것도 켜둔 작업물만
--  · 로그인(authenticated) = 나. 어드민에서 전부 읽고 쓰기
--
--  이걸 건너뛰면 데이터를 넣어도 화면에 아무것도 안 뜹니다.
-- ============================================================

alter table public.works   enable row level security;
alter table public.profile enable row level security;

-- 예전 정책이 남아 있으면 정리
drop policy if exists "works are viewable by everyone" on public.works;
drop policy if exists "works: public read visible"     on public.works;
drop policy if exists "works: admin read all"          on public.works;
drop policy if exists "works: admin insert"            on public.works;
drop policy if exists "works: admin update"            on public.works;
drop policy if exists "works: admin delete"            on public.works;
drop policy if exists "profile: public read"           on public.profile;
drop policy if exists "profile: admin update"          on public.profile;

-- 방문자 — 켜둔 작업물만 읽기
create policy "works: public read visible"
  on public.works for select to anon
  using (is_visible = true);

-- 나(로그인) — 숨긴 것까지 전부 읽기
create policy "works: admin read all"
  on public.works for select to authenticated
  using (true);

-- 나(로그인) — 추가 · 수정 · 삭제
create policy "works: admin insert"
  on public.works for insert to authenticated
  with check (true);

create policy "works: admin update"
  on public.works for update to authenticated
  using (true) with check (true);

create policy "works: admin delete"
  on public.works for delete to authenticated
  using (true);

-- 프로필 — 누구나 읽기, 나만 수정
create policy "profile: public read"
  on public.profile for select to anon, authenticated
  using (true);

create policy "profile: admin update"
  on public.profile for update to authenticated
  using (true) with check (true);


-- ============================================================
--  4. 확인 — 잘 됐는지 보기
-- ============================================================

select sort_order, is_visible, title from public.works order by sort_order;
select name, role, email from public.profile;


-- ============================================================
--  다음 할 일 — 어드민 계정 만들기 (대시보드에서 클릭으로)
--
--  Authentication → Users → "Add user" → "Create new user"
--    · Email    : 본인 이메일
--    · Password : 쓸 비밀번호
--    · "Auto Confirm User" 를 반드시 켜세요 (안 켜면 로그인 안 됩니다)
--
--  그리고 Authentication → Sign In / Providers →
--  "Allow new users to sign up" 을 꺼두세요. 나 말고는 못 만들게.
-- ============================================================
