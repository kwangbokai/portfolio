// ============================================================
//  어드민 — 작업물 추가 · 수정 · 숨김 · 순서 바꾸기, 프로필 편집
//
//  로그인은 Supabase 자체 로그인을 씁니다. 서버 코드가 없습니다.
//  누가 무엇을 할 수 있는지는 supabase-setup.sql 의 보안 설정(RLS)이
//  정합니다. 이 파일을 아무리 뜯어봐도 로그인 없이는 못 씁니다.
// ============================================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const $ = (id) => document.getElementById(id);

const boot = $("boot");
const loginBox = $("login");
const panel = $("panel");

// ── 연결 확인 ───────────────────────────────────────────────
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  boot.textContent =
    "아직 Supabase 에 연결되지 않았습니다. config.js 의 SUPABASE_URL 과 SUPABASE_ANON_KEY 를 채운 뒤 새로고침하세요.";
  throw new Error("Supabase not configured");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── 로그인 상태에 따라 화면 전환 ────────────────────────────
async function boot_() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  boot.hidden = true;

  if (session) {
    showPanel(session);
  } else {
    loginBox.hidden = false;
  }
}

function showPanel(session) {
  loginBox.hidden = true;
  panel.hidden = false;
  $("admin-who").textContent = `${session.user.email} 로 로그인됨`;
  loadWorks();
  loadProfile();
}

// ── 로그인 · 로그아웃 ───────────────────────────────────────
$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("login-submit");
  const err = $("login-error");
  err.hidden = true;
  btn.disabled = true;
  btn.textContent = "확인 중…";

  const { data, error } = await supabase.auth.signInWithPassword({
    email: $("login-email").value.trim(),
    password: $("login-password").value,
  });

  btn.disabled = false;
  btn.textContent = "들어가기";

  if (error) {
    err.hidden = false;
    err.textContent =
      error.message === "Invalid login credentials"
        ? "이메일이나 비밀번호가 맞지 않습니다."
        : `로그인하지 못했습니다 — ${error.message}`;
    return;
  }

  showPanel(data.session);
});

$("logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  location.reload();
});

// ── 탭 ─────────────────────────────────────────────────────
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    $("tab-works").hidden = tab.dataset.tab !== "works";
    $("tab-profile").hidden = tab.dataset.tab !== "profile";
  });
});

// ============================================================
//  작업물
// ============================================================

let works = [];
let editingId = null;

async function loadWorks() {
  const { data, error } = await supabase
    .from("works")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    $("works-list").textContent = "";
    $("works-empty").hidden = false;
    $("works-empty").textContent = `작업물을 불러오지 못했습니다 — ${error.message}`;
    return;
  }

  works = data;
  renderWorksList();
}

function renderWorksList() {
  const list = $("works-list");
  list.textContent = "";
  $("works-empty").hidden = works.length > 0;

  works.forEach((work) => list.appendChild(createRow(work)));
}

function createRow(work) {
  const row = document.createElement("div");
  row.className = "admin-row";
  row.dataset.id = work.id;
  if (!work.is_visible) row.classList.add("is-hidden-work");

  // 손잡이
  const handle = document.createElement("div");
  handle.className = "handle";
  handle.textContent = "⠿";
  handle.title = "잡고 끌어서 순서 바꾸기";
  attachDrag(handle, row);

  // 썸네일
  const thumb = document.createElement("div");
  thumb.className = "row-thumb";
  thumb.textContent = "🎬";
  if (work.image_url) {
    const img = document.createElement("img");
    img.alt = "";
    img.onload = () => {
      thumb.textContent = "";
      thumb.appendChild(img);
    };
    img.src = work.image_url;
  }

  // 제목 · 설명
  const meta = document.createElement("div");
  meta.className = "row-meta";
  const strong = document.createElement("strong");
  strong.textContent = work.title;
  const span = document.createElement("span");
  span.textContent = work.is_visible
    ? work.summary || ""
    : `숨김${work.summary ? " · " + work.summary : ""}`;
  meta.append(strong, span);

  // 버튼들
  const actions = document.createElement("div");
  actions.className = "row-actions";

  const toggle = document.createElement("button");
  toggle.className = "btn btn--small";
  toggle.textContent = work.is_visible ? "숨기기" : "보이기";
  toggle.addEventListener("click", () => toggleVisible(work));

  const edit = document.createElement("button");
  edit.className = "btn btn--small";
  edit.textContent = "수정";
  edit.addEventListener("click", () => openEditor(work));

  actions.append(toggle, edit);
  row.append(handle, thumb, meta, actions);
  return row;
}

// ── 끌어서 옮기기 (마우스 · 터치 공용) ──────────────────────
function attachDrag(handle, row) {
  handle.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const list = $("works-list");
    row.classList.add("dragging");
    handle.setPointerCapture(e.pointerId);

    const onMove = (ev) => {
      const others = [...list.querySelectorAll(".admin-row:not(.dragging)")];
      const target = others.find((other) => {
        const box = other.getBoundingClientRect();
        return ev.clientY < box.top + box.height / 2;
      });
      if (target) list.insertBefore(row, target);
      else list.appendChild(row);
    };

    const onUp = () => {
      row.classList.remove("dragging");
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      saveOrder();
    };

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  });
}

// 화면에 보이는 차례대로 sort_order 를 1,2,3… 으로 다시 매깁니다.
// 실제로 바뀐 줄만 저장합니다.
async function saveOrder() {
  const ids = [...$("works-list").querySelectorAll(".admin-row")].map((r) =>
    Number(r.dataset.id)
  );

  const changed = [];
  ids.forEach((id, index) => {
    const work = works.find((w) => w.id === id);
    const next = index + 1;
    if (work && work.sort_order !== next) {
      work.sort_order = next;
      changed.push({ id, sort_order: next });
    }
  });

  if (!changed.length) return;

  // 화면 순서와 메모리 순서를 맞춰둡니다
  works.sort((a, b) => a.sort_order - b.sort_order);

  const results = await Promise.all(
    changed.map(({ id, sort_order }) =>
      supabase.from("works").update({ sort_order }).eq("id", id)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed) {
    alert(`순서를 저장하지 못했습니다 — ${failed.error.message}`);
    loadWorks();
  }
}

// ── 숨기기 · 보이기 ─────────────────────────────────────────
async function toggleVisible(work) {
  const next = !work.is_visible;
  const { error } = await supabase
    .from("works")
    .update({ is_visible: next })
    .eq("id", work.id);

  if (error) {
    alert(`바꾸지 못했습니다 — ${error.message}`);
    return;
  }
  work.is_visible = next;
  renderWorksList();
}

// ── 추가 · 수정 폼 ──────────────────────────────────────────
const workForm = $("work-form");

function openEditor(work) {
  editingId = work ? work.id : null;
  $("work-form-title").textContent = work ? "작업물 수정" : "새 작업물";
  $("w-title").value = work ? work.title || "" : "";
  $("w-summary").value = work ? work.summary || "" : "";
  $("w-image").value = work ? work.image_url || "" : "";
  $("w-link").value = work ? work.link_url || "" : "";
  $("w-visible").checked = work ? work.is_visible : true;
  $("work-error").hidden = true;
  workForm.hidden = false;
  $("w-title").focus();
  workForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

$("new-work").addEventListener("click", () => openEditor(null));
$("work-cancel").addEventListener("click", () => {
  workForm.hidden = true;
  editingId = null;
});

workForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("work-save");
  const err = $("work-error");
  err.hidden = true;
  btn.disabled = true;
  btn.textContent = "저장 중…";

  const payload = {
    title: $("w-title").value.trim(),
    summary: $("w-summary").value.trim() || null,
    image_url: $("w-image").value.trim() || null,
    link_url: $("w-link").value.trim() || null,
    is_visible: $("w-visible").checked,
  };

  let error;
  if (editingId) {
    ({ error } = await supabase.from("works").update(payload).eq("id", editingId));
  } else {
    // 새 작업물은 맨 아래로
    const maxOrder = works.reduce((max, w) => Math.max(max, w.sort_order || 0), 0);
    ({ error } = await supabase
      .from("works")
      .insert({ ...payload, sort_order: maxOrder + 1 }));
  }

  btn.disabled = false;
  btn.textContent = "저장";

  if (error) {
    err.hidden = false;
    err.textContent = `저장하지 못했습니다 — ${error.message}`;
    return;
  }

  workForm.hidden = true;
  editingId = null;
  loadWorks();
});

// ============================================================
//  프로필
// ============================================================

async function loadProfile() {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    $("profile-note").hidden = false;
    $("profile-note").className = "form-error";
    $("profile-note").textContent = `프로필을 불러오지 못했습니다 — ${error.message}`;
    return;
  }

  const p = data || {};
  $("p-name").value = p.name || "";
  $("p-role").value = p.role || "";
  $("p-intro").value = p.intro || "";
  $("p-email").value = p.email || "";

  $("p-links").textContent = "";
  (Array.isArray(p.links) ? p.links : []).forEach((link) => addLinkRow(link));
}

function addLinkRow(link = { label: "", url: "" }) {
  const row = document.createElement("div");
  row.className = "link-row";

  const label = document.createElement("input");
  label.type = "text";
  label.placeholder = "이름 (예: 비메오)";
  label.value = link.label || "";

  const url = document.createElement("input");
  url.type = "url";
  url.placeholder = "https://...";
  url.value = link.url || "";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "btn btn--small btn--danger";
  remove.textContent = "삭제";
  remove.addEventListener("click", () => row.remove());

  row.append(label, url, remove);
  $("p-links").appendChild(row);
}

$("add-link").addEventListener("click", () => addLinkRow());

$("profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("profile-save");
  const note = $("profile-note");
  note.hidden = true;
  btn.disabled = true;
  btn.textContent = "저장 중…";

  const links = [...$("p-links").querySelectorAll(".link-row")]
    .map((row) => {
      const [label, url] = row.querySelectorAll("input");
      return { label: label.value.trim(), url: url.value.trim() };
    })
    .filter((link) => link.label && link.url);

  const { error } = await supabase
    .from("profile")
    .update({
      name: $("p-name").value.trim(),
      role: $("p-role").value.trim(),
      intro: $("p-intro").value.trim(),
      email: $("p-email").value.trim(),
      links,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  btn.disabled = false;
  btn.textContent = "저장";
  note.hidden = false;

  if (error) {
    note.className = "form-error";
    note.textContent = `저장하지 못했습니다 — ${error.message}`;
    return;
  }

  note.className = "form-note";
  note.textContent = "저장했습니다. 사이트를 새로고침하면 반영됩니다.";
});

boot_();
