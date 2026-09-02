# 펜션 홈페이지 STANDARD

지음지식서비스 / LoonLab 의 펜션 홈페이지 제작 패키지 **STANDARD 등급** 표준 템플릿.
클라이언트마다 기획을 새로 하지 않고 **콘텐츠만 교체**해 납품하는 것이 이 코드베이스의 목적이다.

## 기준 문서

- `../uploads/펜션홈페이지_STANDARD_기획서.md` — IA, 섹션 순서, 컴포넌트, 반응형 규격의 원본. 구조를 바꿀 때는 반드시 이 문서를 먼저 확인한다.
- `../펜션 메인 시안 v2.dc.html` — 디자인 시안. 채택안은 **2b(WARM SAND) 구성 + 2a(CLEAR BLUE) 컬러**.

## 구조

```
index.html          메인 (기획서 4장 섹션 순서)
room.html           객실 상세 — ?id=<room.id>
reservation.html    이용안내 (아코디언)
about.html          펜션소개
special.html        부대시설 상세 — ?id=<special.no> (시설 탭)
travel.html         주변여행지 (전체 목록)
privacy.html        개인정보처리방침
assets/style.css    디자인 토큰 + 전체 스타일
assets/content.js   ★ 클라이언트별 콘텐츠. 여기만 교체해 납품
assets/main.js      렌더링 + 인터랙션
assets/images/
```

빌드 도구·프레임워크·npm 의존성 없음. Vanilla JS. 이 상태를 유지한다.

## 작업 규칙

- **콘텐츠는 HTML 에 직접 쓰지 않는다.** 화면에 보이는 모든 문구·이미지·목록은 `content.js` 의 `SITE` 에서 온다. HTML 에는 뼈대만, 값은 `main.js` 가 주입한다. HTML 본문에 사람이 읽는 한글 카피가 남으면 안 된다. (예외: 슬라이더 화살표 `aria-label` 같은 고정 a11y 라벨은 렌더층/HTML 에 둔다.)
  - `SITE` 지도: `seo`(페이지별 `<title>`·`<meta>`) · `nav`(GNB 라벨) · `ui`(반복 UI 문구) · `sections`(섹션 헤더 eyebrow+국문 타이틀) · 각 섹션 데이터 배열 · `cta`/`roomCta` · `guide`(서브히어로·인트로·아코디언).
  - 섹션 헤더는 HTML 의 `<div class="sec-head" data-sec="키">` 훅에 `main.js` 의 `renderSectionHeads()` 가 `SITE.sections[키]` 를 주입한다. 헤더 문구를 HTML 에 적지 않는다.
  - **인라인 `style=` 금지.** 프레젠테이션은 `style.css` 의 명명 클래스로(예: `.pre-line` `.sec--flush-top` `.wrap--narrow`).
  - 문구 안 `{rooms}` 토큰은 `SITE.rooms` 길이의 한글 수사(한/두/세/네…)로 자동 치환된다(`main.js` 의 `numKo`/`fill`). 객실 수 카피를 손으로 적지 않는다.
- **컬러는 리터럴로 쓰지 않는다.** `style.css` 최상단 `:root` 토큰만 사용한다. 포인트 컬러(`--point`)는 **예약 전환 요소에만** 쓴다. (기획서 7장)
- 금지: 그라디언트 배경, 그림자 남용, 강조색 2개 이상, 자동재생 음원.
- 객실 수는 `SITE.rooms` 길이로 결정된다. 3개 이상이면 탭, 1~2개면 탭 자동 숨김 — 이 분기를 깨지 않는다. 헤드라인의 객실 수도 여기서 자동 파생된다(위 `{rooms}` 토큰).
- 실시간예약은 전부 외부 링크(`target="_blank"`). 자체 예약·결제는 범위 밖(별도 견적)이다.
- 반응형 3구간: 1200+ / 768~1199 / ~767. 모바일 하단 고정바는 필수.
- 스크롤 모션은 `.fadeup` + IntersectionObserver 만 사용. 라이브러리를 추가하지 않는다.

## 프리뷰 라우터

`main.js` 의 `ROUTER` 분기는 3개 페이지를 단일 HTML 로 묶은 시안 프리뷰용이다.
실제 퍼블리싱에서는 `#view-router` 가 없어 항상 false 이므로 신경 쓰지 않아도 된다. **삭제하지 말 것.**

## 미구현 (다음 작업 후보)

- 공지사항 게시판 (관리자 등록형) — 정적 사이트라 저장 방식(JSON 수동 편집 등) 설계 먼저
- `content.js` 의 TODO: `brand.booking`(실시간예약 URL), `location.mapEmbed`(지도 iframe), 실제 이미지

서브페이지 4종(`about`/`special`/`travel`/`privacy`)은 구현 완료. 서브 히어로 문구는 `SITE.pages`, 개인정보처리방침 본문은 `SITE.privacy`, 부대시설 상세 본문은 각 `special[].body` 에서 온다. 렌더 함수는 `main.js` 의 `renderAbout`/`renderSpecial`/`renderTravel`/`renderPrivacy`, 예약 CTA 배너는 공통 `injectCta()`.
