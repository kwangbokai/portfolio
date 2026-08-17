// ============================================================
//  화면을 그리는 코드입니다. 여기는 안 건드려도 됩니다.
//  글자를 바꾸려면 어드민(/admin) 을 쓰거나 config.js 를 여세요.
// ============================================================

const SB_READY = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const SB_BASE = SUPABASE_URL.replace(/\/$/, "");
const SB_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

// ── 상단 프로필 그리기 ──────────────────────────────────────
function renderProfile(profile) {
  const el = document.getElementById("profile");
  el.textContent = "";

  const h1 = document.createElement("h1");
  h1.textContent = profile.name || "";

  const role = document.createElement("p");
  role.className = "role";
  role.textContent = profile.role || "";

  const intro = document.createElement("p");
  intro.className = "intro";
  intro.textContent = profile.intro || "";

  const contact = document.createElement("div");
  contact.className = "contact";

  if (profile.email) {
    const mail = document.createElement("a");
    mail.className = "primary";
    mail.href = `mailto:${profile.email}`;
    mail.textContent = profile.email;
    contact.appendChild(mail);
  }

  (profile.links || []).forEach((link) => {
    if (!link || !link.url || !link.label) return;
    const a = document.createElement("a");
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = link.label;
    contact.appendChild(a);
  });

  el.append(h1, role, intro);
  if (contact.children.length) el.appendChild(contact);

  const title = `${profile.name || ""} — ${profile.role || ""}`.trim();
  if (title !== "—") document.title = title;
  document.getElementById("footer-name").textContent =
    [profile.name, profile.role].filter(Boolean).join(" · ");
}

// ── 작업물 카드 하나 만들기 ─────────────────────────────────
function createCard(work) {
  const hasLink = Boolean(work.link_url);
  const card = document.createElement(hasLink ? "a" : "div");
  card.className = "card";

  if (hasLink) {
    card.href = work.link_url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
  }

  // 썸네일 — 주소가 없거나 이미지가 깨지면 기본 아이콘이 자리를 지킵니다
  const thumb = document.createElement("div");
  thumb.className = "thumb";
  thumb.textContent = "🎬";

  if (work.image_url) {
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = "";
    img.onload = () => {
      thumb.textContent = "";
      thumb.appendChild(img);
    };
    img.src = work.image_url;
  }

  const meta = document.createElement("div");
  meta.className = "meta";

  const title = document.createElement("h3");
  title.textContent = work.title || "제목 없음";
  meta.appendChild(title);

  if (work.summary) {
    const summary = document.createElement("p");
    summary.textContent = work.summary;
    meta.appendChild(summary);
  }

  // 썸네일 아래에 제목 줄. 링크가 있으면 오른쪽에 화살표.
  const body = document.createElement("div");
  body.className = "card-body";
  body.appendChild(meta);

  if (hasLink) {
    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.textContent = "↗";
    body.appendChild(arrow);
  }

  card.append(thumb, body);
  return card;
}

// ── 작업물 목록 그리기 ──────────────────────────────────────
function renderWorks(works, noticeText) {
  const el = document.getElementById("works");
  el.textContent = "";

  if (noticeText) {
    const notice = document.createElement("p");
    notice.className = "notice";
    notice.textContent = noticeText;
    el.appendChild(notice);
  }

  if (!works.length) {
    const empty = document.createElement("p");
    empty.className = "state";
    empty.textContent =
      "아직 등록된 작업물이 없습니다. 어드민(/admin)에서 작업물을 추가하면 여기에 나타납니다.";
    el.appendChild(empty);
    return;
  }

  works.forEach((work) => el.appendChild(createCard(work)));
}

function renderError(message) {
  const el = document.getElementById("works");
  el.textContent = "";
  const p = document.createElement("p");
  p.className = "state";
  p.textContent = message;
  el.appendChild(p);
}

// ── Supabase 에서 가져오기 ──────────────────────────────────
async function sbGet(path) {
  const res = await fetch(`${SB_BASE}/rest/v1/${path}`, { headers: SB_HEADERS });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`${res.status} ${detail}`);
  }
  return res.json();
}

async function loadProfile() {
  // Supabase 에 프로필이 있으면 그걸 쓰고, 없으면 config.js 값을 씁니다
  if (!SB_READY) return renderProfile(PROFILE);

  try {
    const rows = await sbGet("profile?select=name,role,intro,email,links&id=eq.1");
    const row = rows[0];
    renderProfile(row && row.name ? row : PROFILE);
  } catch (err) {
    console.error("프로필을 불러오지 못했습니다:", err);
    renderProfile(PROFILE); // 실패해도 화면은 채웁니다
  }
}

async function loadWorks() {
  // 아직 연결 전이면 샘플을 보여줍니다
  if (!SB_READY) {
    renderWorks(
      SAMPLE_WORKS,
      "샘플 작업물입니다. config.js 에 Supabase 주소와 키를 넣으면 실제 작업물로 바뀝니다."
    );
    return;
  }

  try {
    const works = await sbGet(
      "works?select=title,summary,image_url,link_url,sort_order" +
        "&is_visible=eq.true&order=sort_order.asc"
    );
    renderWorks(works);
  } catch (err) {
    console.error(err);
    renderError(
      "작업물을 불러오지 못했습니다. supabase-setup.sql 을 실행했는지, " +
        "config.js 의 주소와 키가 맞는지 확인해주세요. (F12 → Console 에 자세한 내용이 있습니다)"
    );
  }
}

loadProfile();
loadWorks();
