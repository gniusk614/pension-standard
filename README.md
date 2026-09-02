# 펜션 홈페이지 STANDARD — 퍼블리싱 세트

지음지식서비스 / LoonLab · `펜션홈페이지_STANDARD_기획서.md` 기준 구현
디자인 방향: 시안 v2 `2b WARM SAND` 구성 + `2a CLEAR BLUE` 컬러

## 파일 구조

```
index.html          메인페이지 (기획서 4장 섹션 순서 그대로)
room.html           객실 상세 — ?id=pool-a 형태로 객실 지정
reservation.html    이용안내 (아코디언)
assets/
  style.css         디자인 토큰 + 전체 스타일
  content.js        ★ 클라이언트별 콘텐츠 (여기만 교체)
  main.js           렌더링 + 인터랙션
  images/           이미지
```

빌드 도구 없음. 파일 그대로 웹호스팅에 업로드하면 동작합니다.
로컬 확인 시 파일을 직접 열지 말고 간단한 서버를 띄우세요. (`python3 -m http.server`)

## 클라이언트 교체 절차

1. **포인트 컬러** — `style.css` 최상단 `--point` 1줄 수정 (`--point-dark`, `--point-soft` 동반 수정)
2. **콘텐츠** — `content.js` 만 교체. HTML/CSS 는 손대지 않습니다.
   - `seo` 페이지별 `<title>`·설명·OG (검색/공유 노출 문구)
   - `brand` 상호·전화·SNS·**실시간예약 외부 URL**
   - `biz` 사업자 정보 (푸터 자동 반영)
   - `nav` GNB 메뉴 라벨 / `ui` 버튼·라벨 등 반복 문구
   - `sections` 각 섹션 헤더(영문 eyebrow + 국문 타이틀)
     - `sections.rooms.title` 의 `{rooms}` 는 객실 수에 맞춰 한글 수사(한/두/세/네…)로 자동 치환됩니다. 숫자를 직접 적지 마세요.
   - `rooms` 객실 배열 — 개수만 늘리면 탭이 자동 생성됩니다 (최대 6개 권장)
     - 객실이 1~2개면 탭이 자동으로 숨겨집니다 (기획서 4.4)
   - `special` / `travel` / `gallery` / `cta` / `roomCta` / `guide` 배열
   - `location.mapEmbed` 에 네이버·카카오 지도 iframe 주소
3. **이미지** — `assets/images/` 에 넣고 `content.js` 경로만 수정
   - 현재는 전부 `pension.png` 플레이스홀더입니다

## 구현 상태

구현됨
- 헤더 스크롤 축소(80→64px) + 배경 전환, 모바일 햄버거
- 히어로 풀스크린 슬라이드(5초 페이드), SCROLL 인디케이터
- ROOMS 탭 전환 + 스펙 3종 규격 블록(ROOM INFO / MIN·MAX / CHECK-IN·OUT)
- SPECIAL 3열 그리드, 갤러리 라이트박스, TRAVEL 소요시간·거리 병기
- LOCATION 지도 + 주소 복사, 예약 CTA
- 팝업 레이어(24시간 열지 않기 · 쿠키), 플로팅 예약·TOP, 모바일 하단 고정바
- 객실 상세 슬라이더 · 구비품목 · 객실 페이지네이션
- 이용안내 아코디언 7종(환불 규정 표 포함)
- 스크롤 페이드업(IntersectionObserver), `prefers-reduced-motion` 대응
- 반응형 1200 / 768 / 767 3구간

- 서브페이지 4종 — `about.html`(펜션소개) · `special.html`(부대시설 상세, 시설 탭 + `?id=`) · `travel.html`(주변여행지 전체) · `privacy.html`(개인정보처리방침)

미구현 (합의된 이번 범위 밖)
- 공지사항 게시판 (관리자 등록형)

## 주의

- 실시간예약은 전부 외부 링크 `target="_blank"` 입니다. `content.js`의 `brand.booking` 미설정 시 링크가 동작하지 않습니다.
- 폰트는 jsDelivr CDN(Wanted Sans / Pretendard)에서 로드합니다. 폐쇄망 납품 시 웹폰트를 `assets/fonts/` 로 내려 받아 교체하세요.
