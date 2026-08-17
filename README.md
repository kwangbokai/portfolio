# 이광복 — 영상 디자이너 · 작업물 한 장

설계도 [`prd-v1.md`](prd-v1.md) · [`prd-v3-admin.md`](prd-v3-admin.md) 로 만든 포트폴리오 사이트와 어드민.

빌드 과정이 없습니다. Node.js 도 필요 없습니다.

```
index.html            사이트 화면
app.js                사이트 로직
admin.html            어드민 화면
admin.js              어드민 로직
styles.css            공통 스타일
admin.css             어드민 전용 스타일
config.js         ←   Supabase 연결 정보 (여기만 채우면 됩니다)
supabase-setup.sql    Supabase 에 한 번만 실행할 SQL
vercel.json           /admin 주소가 되게 하는 설정
```

---

## 전체 순서

**1 → 2 → 3 순서대로 하시면 됩니다.** 1번을 안 하면 나머지가 안 돌아갑니다.

| | 무엇 | 걸리는 시간 |
|---|---|---|
| 1 | Supabase 만들기 · SQL 실행 · 계정 만들기 | 10분 |
| 2 | `config.js` 채우기 | 2분 |
| 3 | GitHub → Vercel 배포 | 10분 |

---

## 1. Supabase 준비

### ① 프로젝트 만들기

1. [supabase.com](https://supabase.com) 로그인 → **New project**
2. 이름은 아무거나 (`portfolio` 정도), 지역은 **Northeast Asia (Seoul)**
3. 데이터베이스 비밀번호는 어딘가 적어두세요. 다시 안 보여줍니다
4. 만들어지는 데 1~2분

### ② 표 만들기 — 가장 중요합니다

1. 왼쪽 메뉴 **SQL Editor** → **New query**
2. [`supabase-setup.sql`](supabase-setup.sql) 을 열어 **전체 복사** → 붙여넣기 → **Run**

여기서 `works` 표, `profile` 표, 그리고 **보안 설정(RLS)** 까지 한꺼번에 만듭니다.

> **이걸 건너뛰면 작업물을 넣어도 화면에 아무것도 안 뜹니다.** 오류도 안 나서 한참 헤매요. 가장 많이 막히는 지점입니다.

### ③ 내 계정 만들기 — 어드민에 들어갈 계정

1. 왼쪽 메뉴 **Authentication** → **Users** → **Add user** → **Create new user**
2. 이메일과 비밀번호를 넣고
3. **"Auto Confirm User" 를 반드시 켜세요.** 안 켜면 로그인이 안 됩니다

그리고 남이 계정을 못 만들게 막아둡니다.

4. **Authentication** → **Sign In / Providers** → **"Allow new users to sign up" 끄기**

### ④ 주소와 키 확인

**Project Settings** → **API** 에서 두 값을 복사해두세요. 다음 단계에서 씁니다.

- **Project URL** — `https://xxxxx.supabase.co`
- **anon public** 키 — 아주 긴 문자열

---

## 2. config.js 채우기

[`config.js`](config.js) 를 열어서 아래 두 줄을 채웁니다.

```js
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGci...";
```

> **이 두 값은 브라우저에 노출돼도 되는 값입니다.** 공개용으로 설계된 키예요.
> 이 키가 할 수 있는 건 "켜둔 작업물 읽기"가 전부입니다. 쓰기는 로그인해야만 됩니다.
> 대신 1-②번의 보안 설정을 꼭 해두셔야 이 말이 성립합니다.

여기까지 하면 `index.html` 을 브라우저로 열었을 때 샘플이 아니라 실제 데이터가 뜹니다.

---

## 3. Vercel 배포

Node.js 가 없어서 Vercel CLI 는 못 씁니다. **GitHub 를 거치는 방법**으로 갑니다. 한 번만 해두면 다음부터는 푸시만 하면 자동 배포됩니다.

### ① GitHub 저장소 만들기

[github.com](https://github.com) → **New repository**. **Public / Private 아무거나** 됩니다. README 는 추가하지 마세요.

### ② 올리기

이 폴더에서 아래를 순서대로. `내아이디`와 `저장소이름`만 본인 것으로 바꾸세요.

```bash
git remote add origin https://github.com/내아이디/저장소이름.git
```

```bash
git branch -M main ; git push -u origin main
```

> 첫 커밋은 이미 만들어져 있습니다. GitHub 로그인 창이 뜨면 브라우저로 승인하시면 됩니다.

### ③ Vercel 에 연결

1. [vercel.com](https://vercel.com) 에 **GitHub 계정으로 로그인**
2. **Add New → Project** → 방금 만든 저장소 **Import**
3. 설정은 **아무것도 건드리지 말고** 그냥 **Deploy**
   - Framework Preset: `Other`
   - Build Command · Output Directory 는 비워두세요
4. 1분 안에 `https://저장소이름.vercel.app` 주소가 나옵니다

**여기까지 오면 오늘 목표 달성입니다.**

### ④ 어드민 들어가기

```
https://저장소이름.vercel.app/admin
```

1-③에서 만든 이메일과 비밀번호로 로그인합니다.

---

## 어드민 쓰는 법

폰에서도 그대로 됩니다.

| 하고 싶은 것 | 어떻게 |
|---|---|
| 작업물 추가 | **작업물** 탭 → **+ 새 작업물** → 채우고 저장 |
| 작업물 수정 | 항목 오른쪽 **수정** |
| 사이트에서 감추기 | 항목 오른쪽 **숨기기**. 데이터는 남아서 언제든 되돌립니다 |
| 순서 바꾸기 | 왼쪽 **손잡이(⠿)를 잡고** 위아래로 끌기. 놓으면 자동 저장 |
| 이름·소개·이메일·링크 고치기 | **프로필** 탭 |

**손잡이를 잡아야만 끌립니다.** 다른 데를 잡으면 평소대로 스크롤돼요. 폰에서 스크롤과 안 부딪히게 일부러 이렇게 만들었습니다.

**완전 삭제 버튼은 없습니다.** 숨김으로 충분하고, 오터치로 날아가는 게 더 위험하다고 봤습니다. 정말 지워야 하면 Supabase 대시보드에서 지우세요.

### 이미지는 어떻게 넣나요

업로드가 아니라 **주소 붙여넣기**입니다. 이미 인터넷에 올라간 이미지의 주소를 씁니다.

- 비메오·유튜브 썸네일 주소
- 노션에 올린 이미지 → 우클릭 → "이미지 주소 복사"

비워두면 🎬 아이콘이 자리를 지킵니다. 카드가 무너지지 않아요.

---

## 고칠 때

**작업물·프로필 내용**만 바꾸는 건 어드민에서 하면 끝입니다. 배포가 필요 없어요.

**코드나 디자인**을 고쳤다면 푸시해야 반영됩니다.

```bash
git add . ; git commit -m "내용 수정" ; git push
```

---

## 완성 확인

**사이트**

- [ ] Vercel 배포 주소가 열린다
- [ ] 작업물이 **순서대로** 보인다
- [ ] 카드를 누르면 외부 링크가 새 탭으로 열린다
- [ ] 폰에서 레이아웃이 깨지지 않는다

**어드민**

- [ ] `/admin` 에서 로그인된다
- [ ] 로그아웃 상태로 `/admin` 에 가면 로그인 화면에서 막힌다
- [ ] 작업물을 추가하면 사이트에 뜬다
- [ ] 숨기면 사이트에서 사라지고, 켜면 돌아온다
- [ ] 손잡이를 끌어 순서를 바꾸면 사이트 순서도 바뀐다
- [ ] 프로필을 고치면 사이트 상단이 바뀐다

---

## 막혔을 때

| 증상 | 원인 |
|---|---|
| 작업물이 하나도 안 뜬다 | `supabase-setup.sql` 을 안 돌렸을 가능성이 가장 큽니다 |
| "불러오지 못했습니다" | `config.js` 의 주소나 키 오타. 앞뒤 공백도 확인 |
| 샘플 작업물이 계속 보인다 | `config.js` 의 두 값이 아직 비어 있습니다 |
| 로그인이 안 된다 | 계정 만들 때 **Auto Confirm User** 를 안 켰을 확률이 높습니다. Authentication → Users 에서 계정을 지우고 다시 만드세요 |
| 어드민에서 저장이 안 된다 | 보안 설정이 덜 됐습니다. `supabase-setup.sql` 을 다시 한 번 통째로 실행하세요 (여러 번 실행해도 안전합니다) |
| 어드민 화면이 안 뜬다 | 어드민은 인터넷에서 라이브러리를 하나 받아옵니다. 네트워크가 막힌 환경이면 안 떠요 |
| `/admin` 이 404 | Vercel 이 `vercel.json` 을 못 읽었습니다. 파일이 올라갔는지 확인하고 재배포하세요 |
| 이미지 자리에 🎬 만 | `image_url` 이 비었거나 주소가 잘못됐습니다. 급한 건 아닙니다 |
| 카드를 눌러도 반응 없음 | `link_url` 이 비어 있습니다. 의도한 동작이에요 |

브라우저에서 `F12` → **Console** 탭에 자세한 오류가 나옵니다.

---

## 설계도

- [`prd-v1.md`](prd-v1.md) — 오늘 만든 것
- [`prd-v2.md`](prd-v2.md) — 앞으로의 지도. 지금 다 안 정해져 있는 게 정상입니다
- [`prd-v3-admin.md`](prd-v3-admin.md) — 어드민을 왜 이렇게 만들었는지
