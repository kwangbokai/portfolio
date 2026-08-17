// ============================================================
//  여기만 고치면 됩니다.
//  화면에 보이는 글자와 연결 정보를 전부 이 파일에 모아뒀습니다.
//  (설계도 v1 — "자주 바뀔 글자는 한곳에 모아둘 것")
// ============================================================

// ── 1. 상단 프로필 ──────────────────────────────────────────
const PROFILE = {
  name: "이광복",
  role: "영상 디자이너",

  // 한두 문장 소개. 채용 담당자가 5초 안에 읽는 부분입니다.
  // ↓ 지금은 예시 문구입니다. 본인 말로 바꿔주세요.
  intro:
    "브랜드의 메시지를 움직임으로 옮깁니다. 광고, 뮤직비디오, 모션그래픽 작업을 해왔습니다.",

  email: "xox8121@gmail.com",

  // 외부 링크 1~3개. 안 쓸 링크는 줄째로 지우면 화면에서도 사라집니다.
  // ※ Supabase 에 연결된 뒤에는 어드민(/admin)의 프로필 탭이 우선입니다.
  //    여기 값은 연결이 끊겼을 때 쓰는 예비용입니다.
  links: [
    { label: "인스타그램", url: "https://www.instagram.com/imagine_imotion/" },
    { label: "비메오", url: "https://vimeo.com/user82831253" },
  ],
};

// ── 2. 첫 화면에 크게 뜨는 이름 ─────────────────────────────
//  줄 단위로 적습니다. 글자 하나씩 올라오는 등장에 쓰입니다.
const BRAND = {
  mark: "ii", // 왼쪽 위 작은 표시
  lines: ["IMAGINE", "IMOTION"],
};

// ── 3. 가운데 큰 한 문단 ────────────────────────────────────
const STATEMENT =
  "브랜드가 하고 싶은 말을 움직임으로 옮깁니다. 게임 광고와 SNS 영상, 모션그래픽을 만듭니다.";

// ── 4. 브라우저 탭에 뜨는 제목 ──────────────────────────────
const SITE_TITLE = `${PROFILE.name} — ${PROFILE.role}`;

// ── 3. Supabase 연결 정보 ───────────────────────────────────
//  Supabase 프로젝트를 만든 뒤 아래 두 줄을 채우세요.
//  Supabase 대시보드 → Project Settings → API 에서 찾을 수 있습니다.
//
//  · SUPABASE_URL      = "Project URL"
//  · SUPABASE_ANON_KEY = "anon public" 키
//
//  이 두 값은 브라우저에 노출돼도 괜찮은 값입니다. (공개용으로 설계된 키)
//  단, supabase-setup.sql 의 보안 설정(RLS)을 꼭 먼저 실행하세요.
//
//  비워두면 아래 샘플 작업물이 대신 보입니다.
const SUPABASE_URL = "https://tkjkgnglwehsrzdujsez.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRramtnbmdsd2Voc3J6ZHVqc2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MzYyODIsImV4cCI6MjEwMjUxMjI4Mn0.MalmpZKpf_RQBkjjE6-4SchR894z9U7ROXxAfnSQ6nI";

// ── 4. 샘플 작업물 (Supabase 연결 전에만 보입니다) ──────────
const SAMPLE_WORKS = [
  {
    title: "샘플 · 브랜드 캠페인 영상",
    summary: "2025 · 편집 · 모션그래픽",
    image_url: "",
    link_url: "",
    sort_order: 1,
  },
  {
    title: "샘플 · 뮤직비디오",
    summary: "2024 · 연출 · 색보정",
    image_url: "",
    link_url: "",
    sort_order: 2,
  },
  {
    title: "샘플 · 제품 소개 모션그래픽",
    summary: "2024 · 디자인 · 애니메이션",
    image_url: "",
    link_url: "",
    sort_order: 3,
  },
];
