/* ==========================================================================
   몽산포 휴일펜션 — 콘텐츠 데이터
   (지음지식서비스 / LoonLab STANDARD 템플릿)
   클라이언트 납품 시 이 파일 하나만 교체하면 됩니다. (HTML/CSS 수정 불필요)

   [현재 상태] 사진 · 이름 · 주소만 실제 정보로 반영됨.
   객실 소개/스펙, 부대시설 문구, 주변여행지, 요금·사업자정보 등은 추후 제공 예정(placeholder).
   `{rooms}` 토큰은 rooms 배열 길이에 맞춰 한글 수사(한/두/세/네…)로 자동 치환됩니다.
   ========================================================================== */

const IMG = 'assets/images/';
const PH = IMG + 'pension.png';                       // 미제공 항목 placeholder
const EXT1 = IMG + 'exterior-1.jpg';
const EXT2 = IMG + 'exterior-2.jpg';
const BBQ1 = IMG + 'bbq-1.jpg';
const BBQ2 = IMG + 'bbq-2.jpg';
const BBQ3 = IMG + 'bbq-3.jpg';
const BBQ4 = IMG + 'bbq-4.jpg';

const SITE = {
  /* ---------- SEO / 메타 (main.js 가 <title>·<meta> 에 주입) ---------- */
  seo: {
    home: {
      title: '몽산포 휴일펜션',
      desc: '충청남도 태안 몽산포해수욕장 인근, 몽산포 휴일펜션.',
      ogTitle: '몽산포 휴일펜션',
      ogDesc: '충청남도 태안 몽산포, 몽산포 휴일펜션.',
      ogImage: EXT1
    },
    room: { titleSuffix: '몽산포 휴일펜션' },
    guide: {
      title: '이용안내 — 몽산포 휴일펜션',
      desc: '입퇴실 시간, 인원 기준, 부대시설 이용안내, 주차, 환불 규정, 펜션 정책 안내.'
    }
  },

  /* ---------- 기본 정보 ---------- */
  brand: {
    nameEn: '몽산포 휴일펜션',                 // 로고 워드마크
    nameKo: '몽산포 휴일펜션',
    tagline: 'MONGSANPO HOLIDAY PENSION',
    tel: '041-000-0000',                       // TODO: 대표번호 (추후 제공)
    telHref: 'tel:041-000-0000',              // TODO
    kakao: 'https://pf.kakao.com/',           // TODO
    instagram: 'https://instagram.com/',       // TODO
    blog: 'https://blog.naver.com/',           // TODO
    booking: 'https://booking.naver.com/'      // TODO: 실시간예약 외부 링크 (야놀자 / 여기어때 등)
  },

  /* ---------- 사업자 정보 (푸터) — 추후 제공 ---------- */
  biz: {
    company: '몽산포 휴일펜션',
    owner: '준비 중',                          // TODO
    bizNo: '준비 중',                          // TODO
    mailOrderNo: '준비 중',                    // TODO
    addrRoad: '충청남도 태안군 남면 몽산포길 140',
    addrLot: ''                               // TODO: 지번주소 (추후 제공)
  },

  /* ---------- GNB 메뉴 라벨 (순서 = 표시 순서) ---------- */
  nav: ['펜션소개', '객실안내', '부대시설', '주변여행지', '오시는길', '예약안내'],

  /* ---------- 반복 UI 문구 ---------- */
  ui: {
    booking: '실시간예약',
    guideLink: '이용안내',
    viewMore: 'VIEW MORE →',
    allRooms: '전체 객실',
    bookThisRoom: '이 객실 예약하기',
    copyAddr: '주소 복사',
    copied: '복사되었습니다',
    tel: '전화',
    kakao: '카카오톡',
    privacy: '개인정보처리방침',
    roomsPageTitle: '객실안내',
    addrLabel: 'ADDRESS',
    carLabel: '자가용',
    transitLabel: '대중교통'
  },

  /* ---------- 서브페이지 서브 히어로 ---------- */
  pages: {
    about:   { title: '펜션소개',        desc: '충청남도 태안 몽산포, 몽산포 휴일펜션을 소개합니다.', img: EXT1 },
    special: { title: '부대시설',        desc: '몽산포 휴일펜션의 부대시설 안내.', img: BBQ1 },
    travel:  { title: '주변여행지',      desc: '몽산포 휴일펜션 주변의 볼거리와 즐길거리.', img: EXT2 },
    privacy: { title: '개인정보처리방침', desc: '몽산포 휴일펜션 개인정보처리방침.', img: EXT1 }
  },

  /* ---------- 섹션 헤더 (eyebrow = 영문 라벨 / title = 국문 헤드라인) ----------
     ※ 아래 국문 헤드라인은 아직 템플릿 예시 문구입니다. 실제 카피는 추후 반영. */
  sections: {
    hero:     { eyebrow: 'MONGSANPO · TAEAN', title: '머무는 모든 순간이\n쉼이 되도록' },
    about:    { eyebrow: 'About', title: '하루가 객실마다\n다른 속도로 흐릅니다' },
    rooms:    { eyebrow: 'Rooms', title: '{rooms} 개의 객실,\n오늘 하루의 자리' },
    special:  { eyebrow: 'Special', title: '머무는 시간을 채우는 것들' },
    travel:   { eyebrow: 'Travel', title: '주변 여행지' },
    location: { eyebrow: 'Location', title: '오시는 길' }
  },

  /* ---------- 히어로 슬라이드 이미지 ---------- */
  hero: {
    slides: [EXT1, EXT2, IMG + 'room-101-1.jpg']
  },

  /* ---------- ABOUT (소개 카피는 추후 제공) ---------- */
  about: {
    body: '몽산포 휴일펜션은 충청남도 태안 몽산포해수욕장 가까이에 자리합니다.\n소개 문구는 준비 중입니다.',
    images: [EXT1, IMG + 'room-101-1.jpg', IMG + 'room-201-1.jpg']
  },

  /* ---------- ROOMS (101~203호) ----------
     사진·호실명만 실제 반영. 소개/스펙/구비품목은 추후 제공(placeholder). */
  rooms: [
    {
      id: 'room-101', label: '101호', en: 'ROOM 101', name: '101호',
      desc: '몽산포 휴일펜션 101호.\n객실 상세 소개는 준비 중입니다.',
      spec: { info: '추후 안내', people: '추후 안내', checkin: '15:00 / 11:00' },
      amenities: ['무선 와이파이', '에어컨', 'TV', '냉장고', '전기포트', '취사도구', '침구 · 수건', '주차'],
      images: [IMG + 'room-101-1.jpg', IMG + 'room-101-2.jpg', IMG + 'room-101-3.jpg', IMG + 'room-101-4.jpg', IMG + 'room-101-5.jpg', IMG + 'room-101-6.jpg', IMG + 'room-101-7.jpg']
    },
    {
      id: 'room-102', label: '102호', en: 'ROOM 102', name: '102호',
      desc: '몽산포 휴일펜션 102호.\n객실 상세 소개는 준비 중입니다.',
      spec: { info: '추후 안내', people: '추후 안내', checkin: '15:00 / 11:00' },
      amenities: ['무선 와이파이', '에어컨', 'TV', '냉장고', '전기포트', '취사도구', '침구 · 수건', '주차'],
      images: [IMG + 'room-102-1.jpg', IMG + 'room-102-2.jpg', IMG + 'room-102-3.jpg', IMG + 'room-102-4.jpg', IMG + 'room-102-5.jpg']
    },
    {
      id: 'room-103', label: '103호', en: 'ROOM 103', name: '103호',
      desc: '몽산포 휴일펜션 103호.\n객실 상세 소개는 준비 중입니다.',
      spec: { info: '추후 안내', people: '추후 안내', checkin: '15:00 / 11:00' },
      amenities: ['무선 와이파이', '에어컨', 'TV', '냉장고', '전기포트', '취사도구', '침구 · 수건', '주차'],
      images: [IMG + 'room-103-1.jpg', IMG + 'room-103-2.jpg', IMG + 'room-103-3.jpg', IMG + 'room-103-4.jpg']
    },
    {
      id: 'room-201', label: '201호', en: 'ROOM 201', name: '201호',
      desc: '몽산포 휴일펜션 201호.\n객실 상세 소개는 준비 중입니다.',
      spec: { info: '추후 안내', people: '추후 안내', checkin: '15:00 / 11:00' },
      amenities: ['무선 와이파이', '에어컨', 'TV', '냉장고', '전기포트', '취사도구', '침구 · 수건', '주차'],
      images: [IMG + 'room-201-1.jpg', IMG + 'room-201-2.jpg', IMG + 'room-201-3.jpg', IMG + 'room-201-4.jpg', IMG + 'room-201-5.jpg']
    },
    {
      id: 'room-202', label: '202호', en: 'ROOM 202', name: '202호',
      desc: '몽산포 휴일펜션 202호.\n객실 상세 소개는 준비 중입니다.',
      spec: { info: '추후 안내', people: '추후 안내', checkin: '15:00 / 11:00' },
      amenities: ['무선 와이파이', '에어컨', 'TV', '냉장고', '전기포트', '취사도구', '침구 · 수건', '주차'],
      images: [IMG + 'room-202-1.jpg', IMG + 'room-202-2.jpg', IMG + 'room-202-3.jpg', IMG + 'room-202-4.jpg', IMG + 'room-202-5.jpg']
    },
    {
      id: 'room-203', label: '203호', en: 'ROOM 203', name: '203호',
      desc: '몽산포 휴일펜션 203호.\n객실 상세 소개는 준비 중입니다.',
      spec: { info: '추후 안내', people: '추후 안내', checkin: '15:00 / 11:00' },
      amenities: ['무선 와이파이', '에어컨', 'TV', '냉장고', '전기포트', '취사도구', '침구 · 수건', '주차'],
      images: [IMG + 'room-203-1.jpg', IMG + 'room-203-2.jpg', IMG + 'room-203-3.jpg', IMG + 'room-203-4.jpg']
    }
  ],

  /* ---------- SPECIAL (부대시설) ----------
     ※ 문구는 템플릿 예시입니다. 실제 부대시설 정보는 추후 반영.
     사진은 바베큐장·외관만 제공되어 해당 항목에만 반영, 나머지는 placeholder. */
  special: [
    {
      no: '01', en: 'BBQ', ko: '바비큐', img: BBQ1,
      desc: '전용 바비큐장에서 바비큐를 즐길 수 있습니다.',
      body: '부대시설 상세 안내는 준비 중입니다.',
      images: [BBQ1, BBQ2, BBQ3, BBQ4]
    },
    {
      no: '02', en: 'EXTERIOR', ko: '펜션 외관 · 전경', img: EXT1,
      desc: '몽산포 휴일펜션 전경입니다.',
      body: '부대시설 상세 안내는 준비 중입니다.',
      images: [EXT1, EXT2]
    },
    {
      no: '03', en: 'FACILITY', ko: '부대시설 (준비 중)', img: PH,
      desc: '부대시설 정보는 준비 중입니다.',
      body: '부대시설 상세 안내는 준비 중입니다.',
      images: [PH]
    },
    {
      no: '04', en: 'FACILITY', ko: '부대시설 (준비 중)', img: PH,
      desc: '부대시설 정보는 준비 중입니다.',
      body: '부대시설 상세 안내는 준비 중입니다.',
      images: [PH]
    }
  ],

  /* ---------- 갤러리 ---------- */
  gallery: [
    EXT1, EXT2,
    IMG + 'room-101-1.jpg', IMG + 'room-201-1.jpg',
    IMG + 'room-102-1.jpg', IMG + 'room-202-1.jpg',
    IMG + 'room-103-1.jpg', IMG + 'room-203-1.jpg'
  ],

  /* ---------- TRAVEL (주변여행지) — 추후 제공 (아래는 템플릿 예시 문구) ---------- */
  travel: [
    { name: '몽산포해수욕장', time: '준비 중', dist: '준비 중', desc: '주변 여행지 정보는 준비 중입니다.', img: PH },
    { name: '주변 여행지 2', time: '준비 중', dist: '준비 중', desc: '주변 여행지 정보는 준비 중입니다.', img: PH },
    { name: '주변 여행지 3', time: '준비 중', dist: '준비 중', desc: '주변 여행지 정보는 준비 중입니다.', img: PH },
    { name: '주변 여행지 4', time: '준비 중', dist: '준비 중', desc: '주변 여행지 정보는 준비 중입니다.', img: PH }
  ],

  /* ---------- LOCATION ---------- */
  location: {
    mapEmbed: '',  // TODO: 네이버/카카오/구글 지도 iframe src. 비워두면 안내 박스가 표시됩니다.
    car: '자가용 경로 안내는 준비 중입니다.',          // TODO
    transit: '대중교통 안내는 준비 중입니다.',          // TODO
    pickup: '픽업 서비스 운영 여부는 준비 중입니다.'    // TODO
  },

  /* ---------- 예약 CTA (메인) — 카피 추후 제공 ---------- */
  cta: {
    title: '몽산포에서 보내는\n하루',
    desc: '실시간 예약은 외부 예약 시스템에서 진행됩니다.',
    img: EXT1
  },

  /* ---------- 예약 CTA (객실 상세 하단) ---------- */
  roomCta: {
    title: '예약 가능 일자는\n실시간 예약에서 확인하세요',
    img: EXT2
  },

  /* ---------- 팝업 (운영 공지) — 공지 이미지 준비되면 use:true 로 ---------- */
  popup: {
    use: false,
    img: PH,
    link: '#'
  },

  /* ---------- 이용안내 — 추후 제공 (아래는 템플릿 예시) ---------- */
  guide: {
    subhero: { title: '이용안내', img: EXT2 },
    intro: {
      eyebrow: 'Information',
      title: '예약 전 꼭 확인해 주세요',
      desc: '아래 내용은 예약 시 동의한 것으로 간주됩니다.\n문의 사항은 대표번호 또는 카카오톡 채널로 연락 주세요.'
    },
    checkin: [
      ['입실 시간', '15:00'],
      ['퇴실 시간', '11:00'],
      ['청소 시간', '추후 안내'],
      ['얼리 체크인', '추후 안내'],
      ['레이트 체크아웃', '추후 안내']
    ],
    people: [
      ['기준 인원', '객실별 상이 — 추후 안내'],
      ['추가 인원 요금', '추후 안내'],
      ['최대 인원 초과', '최대 인원 초과 입실은 불가하며, 적발 시 퇴실 조치될 수 있습니다.'],
      ['미신고 인원', '미신고 추가 인원 확인 시 추가 요금이 부과될 수 있습니다.']
    ],
    facility: [
      { name: '바비큐', rows: [
        ['이용', '전용 바비큐장 이용 가능'],
        ['요금 · 시간', '추후 안내']
      ]}
    ],
    parking: [
      ['주차', '추후 안내']
    ],
    convenience: [
      ['와이파이', '전 객실 무선 인터넷 제공'],
      ['편의시설', '추후 안내']
    ],
    refund: [
      ['환불 규정', '추후 안내']
    ],
    policy: [
      '펜션 정책(금연 · 반려동물 · 화기 · 소음 등)은 추후 안내됩니다.'
    ]
  },

  /* ---------- 개인정보처리방침 ----------
     표준 템플릿입니다. 실제 납품 시 상호·연락처·수집 항목을 클라이언트에 맞게 검토하세요. */
  privacy: {
    updated: '시행일: 추후 안내',
    intro: '몽산포 휴일펜션(이하 “펜션”)은 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은 펜션이 홈페이지 문의 및 예약 안내 과정에서 개인정보를 어떻게 취급하는지 안내합니다.',
    sections: [
      { h: '1. 수집하는 개인정보 항목',
        body: '펜션은 전화 · 카카오톡 채널을 통한 문의 응대 및 예약 안내를 위해 다음 정보를 수집할 수 있습니다.\n· 필수: 이름, 연락처(휴대전화번호)\n· 선택: 문의 내용에 포함된 예약 희망일 등의 정보\n실시간 예약 · 결제는 외부 예약 시스템에서 이루어지며, 해당 시스템의 개인정보처리방침이 별도로 적용됩니다.' },
      { h: '2. 개인정보의 수집 및 이용 목적',
        body: '수집한 개인정보는 문의 응대, 예약 확인 및 안내, 이용 관련 공지 전달의 목적으로만 이용합니다. 목적 외의 용도로는 이용하지 않습니다.' },
      { h: '3. 개인정보의 보유 및 이용 기간',
        body: '수집 목적이 달성되면 지체 없이 파기합니다. 다만 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.\n· 소비자의 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래 등에서의 소비자보호에 관한 법률)' },
      { h: '4. 개인정보의 제3자 제공',
        body: '펜션은 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 이용자가 사전에 동의한 경우 또는 법령에 근거해 요구되는 경우는 예외로 합니다.' },
      { h: '5. 개인정보의 파기 절차 및 방법',
        body: '전자적 파일 형태의 정보는 복구할 수 없는 기술적 방법으로 삭제하며, 종이 문서는 분쇄하거나 소각합니다.' },
      { h: '6. 이용자의 권리',
        body: '이용자는 언제든지 본인의 개인정보에 대한 열람 · 정정 · 삭제 · 처리 정지를 요청할 수 있습니다. 요청은 아래 문의처를 통해 접수합니다.' },
      { h: '7. 개인정보 보호책임자 및 문의처',
        body: '개인정보 처리에 관한 문의 · 불만 · 피해 구제는 대표번호로 접수해 주세요. 관련 신고 · 상담은 개인정보침해신고센터(국번없이 118), 대검찰청(1301), 경찰청(182) 등에 문의할 수 있습니다.' },
      { h: '8. 방침의 변경',
        body: '본 방침은 법령 · 정책 또는 운영상 필요에 따라 변경될 수 있으며, 변경 시 홈페이지를 통해 공지합니다.' }
    ]
  }
};
