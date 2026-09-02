# 작업 노트 — 결정 기록

Cowork 세션(2026-09-01)에서 스펙 확정 후 초기 구현까지 진행한 내역.
**왜 이렇게 되어 있는지**를 남기는 문서다. 지금 상태의 규칙은 `CLAUDE.md`, 교체 절차는 `README.md` 를 본다.

---

## 1. 이 코드가 무엇인가

지음지식서비스 / LoonLab 의 펜션 홈페이지 제작 패키지 **STANDARD 등급(180만 원)** 표준 템플릿.
개별 클라이언트마다 기획을 새로 하지 않고, 기획서를 기준선으로 **콘텐츠만 교체**해 납품하는 것이 목적이다.
따라서 이 저장소는 특정 펜션의 사이트가 아니라 **재사용 템플릿**이며, 판단이 갈릴 때는 항상 "다음 클라이언트에서도 그대로 쓸 수 있는가"를 기준으로 삼는다.

## 2. 확정된 결정

### 디자인 — 시안 v2 의 2b 구성 + 2a 컬러

`../펜션 메인 시안 v2.dc.html` 에는 3안이 있었다. (2a CLEAR BLUE / 2b WARM SAND / 2c FRESH MINT)

- **레이아웃은 2b(WARM SAND)** — 여백 큰 에디토리얼, 풀블리드 이미지, 넘버링된 SPECIAL 카드, 대형 예약 CTA
- **컬러는 2a(CLEAR BLUE)** — 포인트 `#0066FF`
- 2b 의 크림 배경(`#FEF9F5`)은 블루와 충돌해 **중립 화이트(`#FFFFFF` / `#F5F6F7`)로 교체**했다. 여백감만 2b 에서 가져왔다.

포인트 컬러를 예약 전환 요소에만 쓰는 것은 기획서 7장의 명시적 요구사항이다. VIEW / 더보기 / DETAIL 은 전부 아웃라인 보조 버튼으로 간다.

### 기술 — 정적 HTML + Vanilla JS

Next.js 도 검토했으나 채택하지 않았다. 이 패키지의 납품 형태는 "클라이언트 웹호스팅에 파일 올리기"이고, 빌드·배포 환경이 끼면 납품 난이도와 유지보수 부담이 올라간다.
대신 **콘텐츠를 `content.js` 한 파일로 분리**해 Next.js 를 쓸 때 얻으려던 이점(콘텐츠/뷰 분리)만 취했다.

### 범위 — 3장

기획서 11장의 Claude Design 전달용 프롬프트가 지정한 산출 범위(메인 / 객실 상세 / 이용안내)를 그대로 따랐다.
`about.html` `special.html` `travel.html` `privacy.html` 과 공지사항 게시판은 **의도적으로 미구현**이다. GNB 링크는 이미 걸려 있으므로 파일만 추가하면 된다.

### 콘텐츠 — 샘플 더미

가상 펜션 `STAY ONDAM`(양양 하조대, 독채 풀빌라) 기준으로 채웠다. 실제 클라이언트가 아니다.
이미지는 전부 `assets/images/pension.png` 플레이스홀더 1장을 돌려쓰고 있다.

### 메뉴 — 한글

GNB 를 `펜션소개 / 객실안내 / 부대시설 / 주변여행지 / 오시는길 / 예약안내` 로 바꿨다.
섹션 레이블(eyebrow)의 영문 표기(`About` `Rooms` `Special` …)와 스펙 라벨(`ROOM INFO` `MIN / MAX` `CHECK-IN / OUT`)은 **디자인 요소로 영문 유지**다. 한글로 바꾸지 않는다.
한글 메뉴에 맞춰 `.gnb` 자간을 `.06em → -.01em`, 크기를 `14 → 15px` 로 조정했다.

## 3. 기획서에서 그대로 가져온 규격

바꾸기 전에 `../uploads/펜션홈페이지_STANDARD_기획서.md` 를 먼저 확인할 것.

- **객실 스펙 3종 고정 포맷** — `ROOM INFO`(구조·주요시설) / `MIN / MAX`(기준·최대 인원) / `CHECK-IN / OUT`(입퇴실). 하이팰리스 레퍼런스에서 채택한 항목으로, 원가를 올리지 않으면서 완성도를 높이는 장치다. 임의로 항목을 늘리거나 줄이지 않는다.
- **객실 수가 구조를 결정한다** — 3개 이상이면 탭, 1~2개면 세로 나열. `SITE.rooms` 길이로 자동 분기하게 구현했다.
- **이용안내의 정보 밀도** — 화이트엔 레퍼런스에서 채택. 문의 전화를 줄이는 것이 이 페이지의 목적이므로, 시설 규격·요금·마감시간·환불 규정까지 다 적는다. 요약하지 않는다.
- **예약은 외부 위임** — 레퍼런스 4곳 전부 그렇다. 자체 예약·결제는 범위 밖(별도 견적)이다.
- **모바일 하단 고정바 필수** — 펜션 유입의 대부분이 모바일이다.
- **영상 히어로는 표준안 제외** — 촬영·인코딩 비용과 소재 확보가 일정 지연 요인이라 옵션으로 분리했다.

## 4. 구현하면서 판단한 것

- **프리뷰 라우터** — 시안 확인용으로 3개 페이지를 단일 HTML 로 묶어야 했다. `main.js` 상단 `ROUTER` 분기와 `href()` 헬퍼가 그것이다. 실제 퍼블리싱에서는 `#view-router` 가 없어 항상 false 다. 코드가 지저분해 보여도 삭제하지 말 것.
- **렌더 함수 진입 조건** — `#page-home` 같은 body id 가 아니라 `#heroSlides` `#slideTrack` `#accList` 의 존재로 판단한다. 단일 파일 프리뷰에서 세 페이지가 한 문서에 공존해야 하기 때문이다.
- **CTA 오버레이** — 이미지 `opacity` 를 낮추는 대신 `::after` 로 어두운 레이어를 덮었다. 이미지가 바뀌어도 텍스트 대비가 유지된다.
- **폰트** — Wanted Sans(영문·브랜드) + Pretendard 폴백. jsDelivr CDN 로드다. 폐쇄망 납품 시 `assets/fonts/` 로 내려받아 교체해야 한다.

## 4-1. 하드코딩 제거 / 스키마 재구성 (2026-09-02)

초기 구현에 남아 있던 하드코딩(HTML 에 박힌 카피·인라인 style)을 걷어내고, "HTML=뼈대 / `content.js`=단일 진실원 / `main.js`=주입" 규칙을 실제로 복원했다. 렌더 결과·디자인은 그대로 두고 데이터 구조만 재구성했다.

- **`content.js` 에 층 추가** — `seo`(페이지 메타) / `nav`(GNB 라벨) / `ui`(반복 UI 문구) / `sections`(섹션 헤더 eyebrow+국문 타이틀) / `roomCta` / `guide.subhero`·`guide.intro`. 기존 hero·about 의 eyebrow/title 도 `sections` 로 이관해 "섹션 헤더는 한 곳"으로 통일.
- **HTML 뼈대화** — `<title>`·`<meta>` 는 비우고 `applySeo()` 가 주입. 섹션 헤더는 `<div class="sec-head" data-sec="키">` 훅 + `renderSectionHeads()`. CTA·인트로·버튼의 한글 리터럴, subhero `<img src>` 전부 제거. 남은 한글은 슬라이더 `aria-label` 2개(고정 a11y 라벨)뿐.
- **인라인 style → 클래스** — `.pre-line` `.sec--flush-top` `.wrap--narrow` `.sec-head--center` `.addr__lot` `.detail__book` `.guide-cta` `.guide-sub` 등으로 이관. 값은 동일해 시각 변화 없음.
- **객실 수 카피 자동화** — `sections.rooms.title` 을 `'{rooms} 채의 독채…'` 토큰으로. `main.js` 의 `numKo`/`fill` 이 `SITE.rooms` 길이(→ 한/두/세/네…)로 치환. 이전의 meta "다섯 채" vs 헤드라인 "네 채" 불일치 버그가 구조적으로 사라졌다. about 카피에서도 고정 숫자("네 채의")를 제거.
- 경계 규칙: 고정 법정 라벨("대표"·"사업자등록번호"·"ALL RIGHTS RESERVED")과 a11y 라벨·순수 글리프는 렌더층에 남겼다. 클라이언트가 만질 값이 아니다.

## 4-2. 서브페이지 4종 구현 (2026-09-02)

기획서 5장 명세대로 `about` / `special` / `travel` / `privacy` 를 4-1 의 데이터 주도 구조 그대로 추가했다. GNB·푸터 링크가 이미 가리키던 404 를 메운 것이다.

- 공통 **서브 히어로**(40vh)는 `room`/`reservation` 패턴 재사용. 문구는 `SITE.pages.<키>`(title/desc/img), breadcrumb 의 영문 중간 라벨(ABOUT/SPECIAL/…)은 HTML 에 고정, 국문 꼬리만 주입.
- **about** — `sections.about` 헤더 + `about.body` + `about.images`(첫 장 풀와이드 그리드) + 공통 CTA.
- **special** — 시설 목록 탭 + 선택 시설 상세(이미지 여러 장 + `special[].body`). `?id=<no>` 로 진입 시설 지정, 선택 시 `<title>` 을 시설명으로 갱신.
- **travel** — `travel` 전체(메인은 4개, 여기선 6개) 3열.
- **privacy** — `SITE.privacy`(updated/intro/sections) 표준 방침 템플릿. 납품 시 상호·연락처·수집 항목 검토 필요.
- 섹션 헤더 주입(`renderSectionHeads`)과 예약 CTA(`injectCta`)를 `boot()` 공통 단계로 올려 메인·서브가 같은 경로를 쓴다.

## 4-3. GNB 재배선 + 호버 서브메뉴 (2026-09-02)

초기엔 GNB 6개 중 4개가 메인 섹션 앵커로 스크롤만 해서 "싱글페이지"처럼 보였다. 전용 페이지가 눈에 보이도록 두 단계로 고쳤다.

- **경로 재배선**(`main.js` `NAV_HREF`) — 펜션소개→about, 부대시설→special, 주변여행지→travel, 예약안내→reservation 은 전용 페이지로. 전용 페이지가 없는 객실안내→`index#rooms`, 오시는길→`index#location` 만 앵커 유지.
- **호버 서브메뉴**(기획서 §3 "호버 시 서브메뉴") — `navChildren(i)` 가 `SITE.rooms`(객실안내) / `SITE.special`(부대시설) 에서 하위 항목을 자동 생성. 객실/시설을 늘리면 메뉴도 따라온다. 데스크탑은 `.gnb > li.has-sub:hover .submenu` CSS 호버(스틸 상태 gap 0), 모바일은 `.mmenu__group` 을 탭으로 확장(`.is-open`). 서브메뉴 하위 링크는 각 상세(`room.html?id=` / `special.html?id=`)로 직행.
- **투명 헤더 위 드롭다운 이질감 처리** — 히어로 위 투명 헤더에서 흰 드롭다운이 붕 떠 보이는 문제. GNB(`.gnb`) 에 `mouseenter` → 헤더에 `is-solid` 추가(스크롤 솔리드와 동일: 흰 배경 + 파랑 로고 + 다크 메뉴), `mouseleave` → `onScroll()` 로 스크롤 위치에 맞춰 원복. 이미 스크롤로 솔리드인 상태와 충돌 없음. 서브페이지(`header--sub`)는 항상 솔리드라 해당 없음.

## 5. 남은 일

1. ~~서브페이지 4종~~ → 4-2 에서 구현 완료
2. 공지사항 게시판 (관리자 등록형)
3. `content.js` TODO 3건 — `brand.booking`(실시간예약 URL), `location.mapEmbed`(지도 iframe), 실제 이미지
4. ~~카피의 객실 수를 실제 객실 수에 맞춰 수정~~ → 4-1 에서 `{rooms}` 토큰 자동 파생으로 해결
5. 시안 확정 후 기존 클라이언트 제안서의 레퍼런스 URL 섹션 뒤에 시안 배치 (기획서 12장)

## 6. 검증 이력

Playwright(Chromium)로 1440px / 390px 렌더링 확인. JS 에러 0건.
확인 항목: ROOMS 탭 전환, 객실 상세 라우팅, 이용안내 아코디언 7종, 라이트박스, 팝업 쿠키, 헤더 스크롤 전환, 모바일 하단 고정바.
