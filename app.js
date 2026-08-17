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

const $ = (id) => document.getElementById(id);
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ============================================================
//  커스텀 커서 — 마우스를 조금 늦게 따라옵니다
// ============================================================

function initCursor() {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!fine || REDUCED) return;

  const dot = $("cursor");
  document.body.classList.add("has-cursor");

  let x = -100;
  let y = -100;
  let tx = -100;
  let ty = -100;

  window.addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
  });

  // 부드럽게 따라붙는 느낌을 주려고 목표 지점으로 조금씩 당깁니다
  (function frame() {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    dot.style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0)`;
    requestAnimationFrame(frame);
  })();

  const big = (on) => () => dot.classList.toggle("is-big", on);
  document.addEventListener("pointerover", (e) => {
    if (e.target.closest("a, button")) big(true)();
  });
  document.addEventListener("pointerout", (e) => {
    if (e.target.closest("a, button")) big(false)();
  });
}

// ============================================================
//  메뉴
// ============================================================

function initMenu() {
  const toggle = $("menu-toggle");
  const menu = $("menu");

  const setOpen = (open) => {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    menu.setAttribute("aria-hidden", String(!open));
  };

  toggle.addEventListener("click", () =>
    setOpen(!document.body.classList.contains("menu-open"))
  );
  menu.querySelectorAll("[data-close]").forEach((a) =>
    a.addEventListener("click", () => setOpen(false))
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

// ============================================================
//  스크롤에 맞춰 등장
// ============================================================

const revealer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        revealer.unobserve(entry.target);
      }
    });
  },
  { rootMargin: "0px 0px -12% 0px" }
);

function watch(el) {
  if (el) revealer.observe(el);
}

// ============================================================
//  히어로 — 글자 하나씩
// ============================================================

function renderHero(profile) {
  const title = $("hero-title");
  title.textContent = "";

  const lines = (BRAND.lines || []).length ? BRAND.lines : [profile.name || ""];
  title.setAttribute("aria-label", lines.join(" "));

  let step = 0;
  lines.forEach((text) => {
    const line = document.createElement("span");
    line.className = "line";
    [...text].forEach((char) => {
      const ch = document.createElement("span");
      ch.className = "ch";
      ch.textContent = char === " " ? " " : char;
      ch.style.transitionDelay = `${step * 0.035}s`;
      step += 1;
      line.appendChild(ch);
    });
    title.appendChild(line);
  });

  $("logo").textContent = BRAND.mark || "";
  $("hero-sub").textContent = [profile.name, profile.role]
    .filter(Boolean)
    .join(" · ");

  // 첫 화면이라 기다리지 않고 바로 등장시킵니다
  requestAnimationFrame(() => $("hero").classList.add("is-in"));
}

// ============================================================
//  소개 · 푸터
// ============================================================

function renderStatement(profile) {
  $("statement-text").textContent = STATEMENT || profile.intro || "";
  watch($("statement-text"));
}

function renderFooter(profile) {
  $("footer-brand-name").textContent = (BRAND.lines || []).join(" ") || profile.name;
  $("footer-bio").textContent = profile.intro || "";

  const socials = $("footer-socials");
  socials.textContent = "";
  (profile.links || []).forEach((link) => {
    if (!link || !link.url || !link.label) return;
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = link.label;
    li.appendChild(a);
    socials.appendChild(li);
  });
  if (!socials.children.length) socials.closest(".footer-col").hidden = true;

  const contact = $("footer-contact");
  contact.textContent = "";
  if (profile.email) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `mailto:${profile.email}`;
    a.textContent = profile.email;
    li.appendChild(a);
    contact.appendChild(li);
  }

  $("footer-copy").textContent = `© ${new Date().getFullYear()} ${
    profile.name || ""
  }`.trim();

  const title = `${profile.name || ""} — ${profile.role || ""}`.trim();
  if (title !== "—") document.title = title;
}

// ============================================================
//  작업물
// ============================================================

// "2024 · 모션그래픽 · 게임 광고" 같은 한 줄에서 연도와 분야를 갈라냅니다
function splitMeta(summary) {
  const parts = String(summary || "")
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
  const yearAt = parts.findIndex((p) => /^(19|20)\d{2}$/.test(p));
  const year = yearAt >= 0 ? parts.splice(yearAt, 1)[0] : "";
  return { year, category: parts.join(" · ") };
}

function fillImage(box, work, klass) {
  const ph = document.createElement("span");
  ph.className = "ph";
  ph.textContent = "◼";
  box.appendChild(ph);

  if (!work.image_url) return;

  const img = document.createElement("img");
  img.loading = "lazy";
  img.alt = work.title || "";
  if (klass) img.className = klass;
  img.onload = () => {
    ph.remove();
    box.insertBefore(img, box.firstChild);
  };
  if (work.image_fallback) {
    img.onerror = () => {
      img.onerror = null;
      img.src = work.image_fallback;
    };
  }
  img.src = work.image_url;
}

function createItem(work) {
  const hasLink = Boolean(work.link_url);
  const item = document.createElement(hasLink ? "a" : "div");
  item.className = "item";
  if (hasLink) {
    item.href = work.link_url;
    item.target = "_blank";
    item.rel = "noopener noreferrer";
  }

  const media = document.createElement("div");
  media.className = "item-media";
  fillImage(media, work);

  const veil = document.createElement("span");
  veil.className = "veil";
  media.appendChild(veil);

  if (hasLink) {
    const go = document.createElement("span");
    go.className = "go";
    go.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M7 17 17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    media.appendChild(go);
  }

  const meta = document.createElement("div");
  meta.className = "item-meta";

  const h3 = document.createElement("h3");
  h3.textContent = work.title || "제목 없음";

  const tail = document.createElement("div");
  tail.className = "item-tail mono";
  const { year, category } = splitMeta(work.summary);
  if (category) {
    const c = document.createElement("span");
    c.className = "cat";
    c.textContent = category;
    tail.appendChild(c);
  }
  if (year) {
    const y = document.createElement("span");
    y.className = "year";
    y.textContent = year;
    tail.appendChild(y);
  }

  meta.append(h3, tail);
  item.append(media, meta);

  const wrap = document.createElement("div");
  wrap.className = "fade";
  wrap.appendChild(item);
  watch(wrap);
  return wrap;
}

function renderMarquee(works) {
  const section = $("marquee");
  const track = $("marquee-track");
  track.textContent = "";

  const withImages = works.filter((w) => w.image_url);
  if (withImages.length < 2) {
    section.hidden = true;
    return;
  }

  // 끊기지 않고 흘러가려면 같은 줄을 두 벌 이어 붙여야 합니다
  let base = withImages;
  while (base.length < 6) base = base.concat(withImages);

  [...base, ...base].forEach((work) => {
    const card = document.createElement("div");
    card.className = "mq-card";
    fillImage(card, work);
    track.appendChild(card);
  });

  section.hidden = false;
}

function renderWorks(works, noticeText) {
  const el = $("works");
  el.textContent = "";
  $("work-count").textContent = works.length
    ? String(works.length).padStart(2, "0")
    : "";

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
      "아직 등록된 작업물이 없습니다. 어드민(/admin)에서 추가하면 여기에 나타납니다.";
    el.appendChild(empty);
    renderMarquee([]);
    return;
  }

  works.forEach((work) => el.appendChild(createItem(work)));
  renderMarquee(works);
}

function renderError(message) {
  const el = $("works");
  el.textContent = "";
  const p = document.createElement("p");
  p.className = "state";
  p.textContent = message;
  el.appendChild(p);
}

// ============================================================
//  데이터 가져오기
// ============================================================

async function sbGet(path) {
  const res = await fetch(`${SB_BASE}/rest/v1/${path}`, { headers: SB_HEADERS });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

function applyProfile(profile) {
  renderHero(profile);
  renderStatement(profile);
  renderFooter(profile);
}

async function loadProfile() {
  if (!SB_READY) return applyProfile(PROFILE);
  try {
    const rows = await sbGet("profile?select=name,role,intro,email,links&id=eq.1");
    const row = rows[0];
    const merged = row && row.name ? row : PROFILE;
    // 어드민에서 링크를 아직 안 넣었으면 config.js 값으로 채웁니다
    if (!merged.links || !merged.links.length) merged.links = PROFILE.links;
    applyProfile(merged);
  } catch (err) {
    console.error("프로필을 불러오지 못했습니다:", err);
    applyProfile(PROFILE);
  }
}

// 데모 모드 — 주소 뒤에 ?demo=1 이 붙었을 때만 켜집니다
const DEMO_ON = new URLSearchParams(location.search).has("demo");

function youtubeId(input) {
  if (!input) return "";
  const raw = input.trim();
  if (!raw.includes("/")) return raw;
  const match = raw.match(
    /(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{6,})/
  );
  return match ? match[1] : "";
}

function demoWorks() {
  return (typeof DEMO_WORKS === "undefined" ? [] : DEMO_WORKS).map((item) => {
    const id = youtubeId(item.youtube);
    return {
      title: item.title,
      summary: item.summary,
      image_url: item.image_url
        ? item.image_url
        : id
        ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
        : "",
      image_fallback: id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : "",
      link_url: item.link_url || (id ? `https://www.youtube.com/watch?v=${id}` : ""),
    };
  });
}

async function loadWorks() {
  if (DEMO_ON) {
    renderWorks(
      demoWorks(),
      "데모 모드입니다. 주소에 ?demo=1 을 붙였을 때만 보이고, 그냥 들어온 방문자에게는 보이지 않습니다."
    );
    return;
  }

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
        "config.js 의 주소와 키가 맞는지 확인해주세요."
    );
  }
}

initCursor();
initMenu();
loadProfile();
loadWorks();
