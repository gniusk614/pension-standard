/* ==========================================================================
   펜션 홈페이지 STANDARD — 공통 스크립트 (라이브러리 의존 없음)
   화면 문구는 전부 content.js(SITE) 에서 온다. 이 파일에는 문구를 적지 않는다.
   (예외: "대표"·"사업자등록번호" 같은 고정 법정 라벨 프리픽스만 렌더층에 둔다.)
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m];
  }); };
  var B = SITE.brand, U = SITE.ui;

  /* 한글 수사 — {rooms} 토큰 치환용 (1~10, 초과 시 숫자) */
  var NUM_KO = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
  function numKo(n) { return NUM_KO[n] || String(n); }
  function fill(s) { return String(s == null ? '' : s).replace(/\{rooms\}/g, numKo(SITE.rooms.length)); }

  /* 단일 파일 프리뷰(#view-router 존재) 여부. 일반 퍼블리싱에서는 false */
  var ROUTER = !!document.getElementById('view-router');

  /* 페이지 링크 — 퍼블리싱은 실제 파일, 프리뷰는 해시 라우팅 */
  function href(page, id) {
    if (ROUTER) {
      if (page === 'room') return '#room=' + encodeURIComponent(id);
      if (page === 'guide') return '#guide';
      return '#home';
    }
    if (page === 'room') return 'room.html?id=' + encodeURIComponent(id);
    if (page === 'guide') return 'reservation.html';
    if (page === 'home') return 'index.html';
    return page + '.html';
  }

  /* ---------- 0. SEO / 메타 주입 ---------- */
  function setMeta(name, val, attr) {
    if (val == null) return;
    attr = attr || 'name';
    var el = document.head.querySelector('meta[' + attr + '="' + name + '"]');
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
    el.setAttribute('content', val);
  }
  /* 현재 페이지 판별 — 존재하는 앵커 요소로 (프리뷰에서는 home 우선) */
  function currentPage() {
    if ($('#heroSlides')) return 'home';
    if ($('#slideTrack')) return 'room';
    if ($('#accList')) return 'guide';
    if ($('#aboutImages')) return 'about';
    if ($('#specialTabs')) return 'special';
    if ($('#travelList')) return 'travel';
    if ($('#privacyBody')) return 'privacy';
    return '';
  }
  function applySeo() {
    var S = SITE.seo, p = currentPage();
    if (p === 'home') {
      document.title = S.home.title;
      setMeta('description', S.home.desc);
      setMeta('og:title', S.home.ogTitle, 'property');
      setMeta('og:description', S.home.ogDesc, 'property');
      setMeta('og:image', S.home.ogImage, 'property');
    } else if (p === 'guide') {
      document.title = S.guide.title;
      setMeta('description', S.guide.desc);
    } else if (SITE.pages[p]) {        // about / special / travel / privacy
      document.title = SITE.pages[p].title + ' — ' + B.nameKo;
      setMeta('description', SITE.pages[p].desc);
    }
    // 객실 상세 <title> 은 renderRoom 이 객실명으로 설정한다.
    // special 상세 <title> 은 renderSpecial 이 시설명으로 갱신한다.
  }

  /* 서브페이지 공통 — 서브 히어로 주입 */
  function renderSubhero(key) {
    var pg = SITE.pages[key];
    if (!pg) return;
    var img = $('#subheroImg'); if (img) img.src = pg.img;
    var t = $('#subheroTitle'); if (t) t.textContent = pg.title;
    var c = $('#crumbNow'); if (c) c.textContent = pg.title;
  }

  /* ---------- 1. 헤더 · 모바일 메뉴 ---------- */
  /* GNB href — 라벨은 SITE.nav, 이동 경로는 여기서 관리 */
  /* GNB 경로 — 전용 페이지가 있으면 그 파일로, 없으면 메인 섹션 앵커로 */
  var NAV_HREF = ROUTER
    ? ['#home', '#home', '#home', '#home', '#home', '#guide']
    : ['about.html', 'index.html#rooms', 'special.html', 'travel.html', 'index.html#location', 'reservation.html'];
  /* GNB 서브메뉴 — SITE.rooms / SITE.special 에서 자동 생성 (없으면 null) */
  function navChildren(i) {
    if (i === 1) return SITE.rooms.map(function (r) { return [href('room', r.id), r.name]; });
    if (i === 2) return SITE.special.map(function (s) {
      return [ROUTER ? '#home' : ('special.html?id=' + encodeURIComponent(s.no)), s.ko];
    });
    return null;
  }

  function renderHeader() {
    var host = $('#site-header');
    if (!host) return;
    var sub = host.dataset.sub === 'true';

    var gnb = SITE.nav.map(function (label, i) {
      var to = NAV_HREF[i] || '#';
      var kids = navChildren(i);
      var submenu = '';
      if (kids && kids.length) {
        submenu = '<ul class="submenu">' + kids.map(function (c) {
          return '<li><a href="' + c[0] + '">' + esc(c[1]) + '</a></li>';
        }).join('') + '</ul>';
      }
      return '<li' + (submenu ? ' class="has-sub"' : '') + '>' +
        '<a href="' + to + '">' + esc(label) + '</a>' + submenu + '</li>';
    }).join('');

    var mnav = SITE.nav.map(function (label, i) {
      var to = NAV_HREF[i] || '#';
      var kids = navChildren(i);
      if (kids && kids.length) {
        return '<div class="mmenu__group">' +
          '<button class="mmenu__parent" type="button">' + esc(label) + '<span aria-hidden="true">＋</span></button>' +
          '<div class="mmenu__sub">' + kids.map(function (c) {
            return '<a href="' + c[0] + '">' + esc(c[1]) + '</a>';
          }).join('') + '</div>' +
        '</div>';
      }
      return '<a class="mmenu__link" href="' + to + '">' + esc(label) + '</a>';
    }).join('');

    host.innerHTML =
      '<header class="header' + (sub ? ' header--sub' : '') + '">' +
        '<div class="header__inner">' +
          '<a class="logo" href="index.html">' + esc(B.nameEn) + '<small>' + esc(B.tagline) + '</small></a>' +
          '<nav><ul class="gnb">' + gnb + '</ul></nav>' +
          '<div class="header__util">' +
            '<a class="header__tel" href="' + esc(B.telHref) + '">' + esc(U.telInquiry) + '</a>' +
            '<div class="header__sns">' +
              '<a href="' + esc(B.instagram) + '" target="_blank" rel="noopener" title="인스타그램">IG</a>' +
              '<a href="' + esc(B.blog) + '" target="_blank" rel="noopener" title="네이버 블로그">BL</a>' +
            '</div>' +
            '<a class="btn btn--primary btn--sm" href="' + esc(B.booking) + '" target="_blank" rel="noopener">' + esc(U.booking) + '</a>' +
            '<button class="hamburger" type="button" aria-label="메뉴 열기"><span></span><span></span><span></span></button>' +
          '</div>' +
        '</div>' +
      '</header>' +
      '<div class="mmenu">' +
        mnav +
        '<a class="btn btn--primary btn--block" href="' + esc(B.booking) + '" target="_blank" rel="noopener">' + esc(U.booking) + '</a>' +
      '</div>';

    var header = $('.header', host);
    if (!sub) {
      var onScroll = function () {
        header.classList.toggle('is-solid', window.scrollY > 40);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      // 투명 헤더 위에서 서브메뉴가 뜨면 흰 드롭다운이 붕 떠 보인다.
      // 메뉴 호버 동안 헤더를 솔리드로 전환하고, 벗어나면 스크롤 위치에 맞춰 원복.
      var gnbEl = $('.gnb', header);
      gnbEl.addEventListener('mouseenter', function () { header.classList.add('is-solid'); });
      gnbEl.addEventListener('mouseleave', onScroll);
    }
    $('.hamburger', host).addEventListener('click', function () {
      document.body.classList.toggle('is-menu');
    });
    // 모바일: 하위 메뉴 탭 확장
    $$('.mmenu__parent', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.parentNode.classList.toggle('is-open');
      });
    });
  }

  /* ---------- 2. 푸터 ---------- */
  function renderFooter() {
    var host = $('#site-footer');
    if (!host) return;
    var z = SITE.biz;
    host.innerHTML =
      '<footer class="footer"><div class="wrap">' +
        '<div class="footer__top">' +
          '<div>' +
            '<div class="footer__logo">' + esc(B.nameEn) + '</div>' +
            '<div class="footer__info">' +
              '<span>' + esc(z.company) + '</span><span>대표 ' + esc(z.owner) + '</span>' +
              '<span>' + esc(B.tel) + '</span>' +
              '<span>' + esc(z.addrRoad) + '</span>' +
              '<span>사업자등록번호 ' + esc(z.bizNo) + '</span>' +
              '<span>농어촌민박 신고번호 ' + esc(z.mailOrderNo) + '</span>' +
            '</div>' +
            '<div class="footer__links">' +
              '<a href="' + (ROUTER ? '#home' : 'privacy.html') + '">' + esc(U.privacy) + '</a>' +
              '<a href="' + href('guide') + '">' + esc(U.guideLink) + '</a>' +
            '</div>' +
          '</div>' +
          '<div class="footer__sns">' +
            '<a href="' + esc(B.instagram) + '" target="_blank" rel="noopener">IG</a>' +
            '<a href="' + esc(B.blog) + '" target="_blank" rel="noopener">BL</a>' +
            '<a href="' + esc(B.kakao) + '" target="_blank" rel="noopener">KA</a>' +
          '</div>' +
        '</div>' +
        '<div class="footer__copy">© ' + new Date().getFullYear() + ' ' + esc(z.company) + '. ALL RIGHTS RESERVED.</div>' +
      '</div></footer>';
  }

  /* ---------- 3. 플로팅 · 모바일 고정바 · 팝업 ---------- */
  function renderFloating() {
    var host = $('#site-floating');
    if (!host) return;
    host.innerHTML =
      '<div class="floating">' +
        '<a class="floating__book" href="' + esc(B.booking) + '" target="_blank" rel="noopener">' + esc(U.booking) + '</a>' +
        '<button class="floating__top" type="button">TOP</button>' +
      '</div>' +
      '<nav class="mbar">' +
        '<a href="' + esc(B.telHref) + '">' + esc(U.tel) + '</a>' +
        '<a href="' + esc(B.kakao) + '" target="_blank" rel="noopener">' + esc(U.kakao) + '</a>' +
        '<a href="' + esc(B.booking) + '" target="_blank" rel="noopener">' + esc(U.booking) + '</a>' +
      '</nav>';

    var top = $('.floating__top', host);
    window.addEventListener('scroll', function () {
      top.classList.toggle('is-on', window.scrollY > 400);
    }, { passive: true });
    top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function renderPopup() {
    var host = $('#site-popup');
    var p = SITE.popup;
    if (!host || !p || !p.use) return;
    if (document.cookie.indexOf('pop_hide=1') > -1) return;

    host.innerHTML =
      '<div class="popup is-on">' +
        '<div class="popup__box">' +
          '<a href="' + esc(p.link) + '"><div class="ph ratio-43"><img src="' + esc(p.img) + '" alt="공지 팝업"></div></a>' +
          '<div class="popup__foot">' +
            '<label><input type="checkbox" id="popHide"> 24시간 열지 않기</label>' +
            '<button type="button" id="popClose">닫기 ✕</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    $('#popClose').addEventListener('click', function () {
      if ($('#popHide').checked) {
        var d = new Date(Date.now() + 864e5);
        document.cookie = 'pop_hide=1; expires=' + d.toUTCString() + '; path=/';
      }
      $('.popup', host).classList.remove('is-on');
    });
  }

  /* ---------- 4. 섹션 헤더 (eyebrow + 국문 타이틀) 주입 ---------- */
  function renderSectionHeads() {
    $$('[data-sec]').forEach(function (el) {
      var s = SITE.sections[el.dataset.sec];
      if (!s) return;
      el.innerHTML =
        '<span class="eyebrow">' + esc(s.eyebrow) + '</span>' +
        '<h2 class="sec-title pre-line">' + esc(fill(s.title)) + '</h2>';
    });
  }

  /* ---------- 5. 스크롤 진입 페이드업 ---------- */
  function initFadeUp() {
    var els = $$('.fadeup');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 6. 라이트박스 ---------- */
  var LB = {
    list: [], idx: 0, el: null,
    open: function (list, i) {
      this.list = list; this.idx = i;
      if (!this.el) {
        var d = document.createElement('div');
        d.className = 'lightbox';
        d.innerHTML =
          '<button class="lightbox__close" type="button" aria-label="닫기">✕</button>' +
          '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="이전">‹</button>' +
          '<img src="" alt="">' +
          '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="다음">›</button>';
        document.body.appendChild(d);
        this.el = d;
        var self = this;
        $('.lightbox__close', d).addEventListener('click', function () { self.close(); });
        $('.lightbox__nav--prev', d).addEventListener('click', function () { self.move(-1); });
        $('.lightbox__nav--next', d).addEventListener('click', function () { self.move(1); });
        d.addEventListener('click', function (e) { if (e.target === d) self.close(); });
        document.addEventListener('keydown', function (e) {
          if (!d.classList.contains('is-on')) return;
          if (e.key === 'Escape') self.close();
          if (e.key === 'ArrowLeft') self.move(-1);
          if (e.key === 'ArrowRight') self.move(1);
        });
      }
      this.paint(); this.el.classList.add('is-on');
    },
    move: function (d) { this.idx = (this.idx + d + this.list.length) % this.list.length; this.paint(); },
    paint: function () { $('img', this.el).src = this.list[this.idx]; },
    close: function () { this.el.classList.remove('is-on'); }
  };

  /* ---------- 7. 메인페이지 렌더 ---------- */
  function renderHome() {
    if (!$('#heroSlides')) return;
    var SEC = SITE.sections;

    /* 히어로 슬라이드 */
    var hs = $('#heroSlides');
    hs.innerHTML = SITE.hero.slides.map(function (src, i) {
      return '<div class="hero__slide' + (i === 0 ? ' is-on' : '') + '"><img src="' + esc(src) + '" alt=""></div>';
    }).join('');
    $('#heroEyebrow').textContent = SEC.hero.eyebrow;
    $('#heroTitle').textContent = fill(SEC.hero.title);
    var slides = $$('.hero__slide', hs), cur = 0;
    if (slides.length > 1) {
      setInterval(function () {
        slides[cur].classList.remove('is-on');
        cur = (cur + 1) % slides.length;
        slides[cur].classList.add('is-on');
      }, 5000);
    }

    /* ABOUT */
    $('#aboutEyebrow').textContent = SEC.about.eyebrow;
    $('#aboutTitle').textContent = fill(SEC.about.title);
    $('#aboutBody').textContent = SITE.about.body;
    $('#aboutMore').textContent = U.viewMore;
    $('#aboutImg').innerHTML = SITE.about.images.map(function (src) {
      return '<div class="ph zoom"><img src="' + esc(src) + '" alt=""></div>';
    }).join('');

    /* ROOMS 탭 */
    var tabs = $('#roomTabs'), panel = $('#roomPanel');
    tabs.innerHTML = SITE.rooms.map(function (r, i) {
      return '<button class="tab' + (i === 0 ? ' is-on' : '') + '" type="button" data-i="' + i + '">' + esc(r.label) + '</button>';
    }).join('');
    // 객실이 1~2개면 탭을 숨기고 세로 나열 (기획서 4.4)
    if (SITE.rooms.length < 3) tabs.style.display = 'none';

    function paintRoom(i) {
      var r = SITE.rooms[i];
      panel.innerHTML =
        '<div class="ph zoom room-panel__img"><img src="' + esc(r.images[0]) + '" alt="' + esc(r.name) + '"></div>' +
        '<div>' +
          '<div class="room-panel__no">' + esc(r.en) + '</div>' +
          '<h3 class="room-panel__name">' + esc(r.name) + '</h3>' +
          '<p class="room-panel__desc">' + esc(r.desc) + '</p>' +
          '<dl class="spec">' +
            '<div><dt>ROOM INFO</dt><dd>' + esc(r.spec.info) + '</dd></div>' +
            '<div><dt>MIN / MAX</dt><dd>' + esc(r.spec.people) + '</dd></div>' +
            '<div><dt>CHECK-IN / OUT</dt><dd>' + esc(r.spec.checkin) + '</dd></div>' +
          '</dl>' +
          '<a class="btn btn--ghost" href="' + href('room', r.id) + '">VIEW ROOM</a>' +
        '</div>';
    }
    paintRoom(0);
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('.tab'); if (!b) return;
      $$('.tab', tabs).forEach(function (t) { t.classList.remove('is-on'); });
      b.classList.add('is-on');
      paintRoom(+b.dataset.i);
    });

    /* SPECIAL */
    $('#specialGrid').innerHTML = SITE.special.map(function (s) {
      return '<a class="special__card" href="' + (ROUTER ? '#home' : 'special.html?id=' + encodeURIComponent(s.no)) + '">' +
        '<div class="ph zoom"><img src="' + esc(s.img) + '" alt="' + esc(s.ko) + '"></div>' +
        '<div class="special__no">' + esc(s.no) + '</div>' +
        '<div class="special__en">' + esc(s.en) + '</div>' +
        '<div class="special__ko">' + esc(s.ko) + '</div>' +
      '</a>';
    }).join('');

    /* 갤러리 */
    var g = SITE.gallery;
    $('#galleryGrid').innerHTML = g.map(function (src, i) {
      return '<button type="button" data-i="' + i + '"><img src="' + esc(src) + '" alt="갤러리 이미지 ' + (i + 1) + '"></button>';
    }).join('');
    $('#galleryGrid').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      LB.open(g, +b.dataset.i);
    });

    /* TRAVEL */
    $('#travelMore').textContent = U.viewMore;
    $('#travelGrid').innerHTML = SITE.travel.slice(0, 4).map(function (t) {
      return '<div class="travel__card">' +
        '<div class="ph zoom"><img src="' + esc(t.img) + '" alt="' + esc(t.name) + '"></div>' +
        '<div class="travel__name">' + esc(t.name) + '</div>' +
        '<div class="travel__meta">' + esc(t.time) + ' · ' + esc(t.dist) + '</div>' +
        '<p class="travel__desc">' + esc(t.desc) + '</p>' +
      '</div>';
    }).join('');

    /* LOCATION */
    var L = SITE.location;
    $('#mapBox').innerHTML = L.mapEmbed
      ? '<iframe src="' + esc(L.mapEmbed) + '" loading="lazy" title="오시는 길 지도"></iframe>'
      : '<div class="map__empty"><strong>MAP</strong><span>content.js 의 location.mapEmbed 에<br>지도 iframe 주소를 넣어주세요</span></div>';
    $('#addrLabel').textContent = U.addrLabel;
    $('#carLabel').textContent = U.carLabel;
    $('#transitLabel').textContent = U.transitLabel;
    $('#addrRoad').textContent = SITE.biz.addrRoad;
    $('#addrLot').textContent = SITE.biz.addrLot;
    $('#carRoute').textContent = L.car;
    $('#transitRoute').textContent = L.transit;
    var copyBtn = $('#copyAddr');
    copyBtn.textContent = U.copyAddr;
    copyBtn.addEventListener('click', function () {
      var t = SITE.biz.addrRoad, btn = this;
      var done = function () { btn.textContent = U.copied; setTimeout(function () { btn.textContent = U.copyAddr; }, 1800); };
      if (navigator.clipboard) { navigator.clipboard.writeText(t).then(done, done); }
      else {
        var ta = document.createElement('textarea');
        ta.value = t; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (err) {}
        document.body.removeChild(ta); done();
      }
    });

  }

  /* 예약 CTA 배너 — 메인·서브 공통 (#ctaImg 가 있는 페이지에만) */
  function injectCta() {
    if (!$('#ctaImg')) return;
    $('#ctaImg').src = SITE.cta.img;
    $('#ctaTitle').textContent = SITE.cta.title;
    var d = $('#ctaDesc'); if (d) d.textContent = SITE.cta.desc;
    $('#ctaBook').textContent = U.booking;
    $('#ctaGuide').textContent = U.guideLink;
  }

  /* ---------- 8. 객실 상세 렌더 ---------- */
  function renderRoom() {
    if (!$('#slideTrack')) return;
    var m = location.hash.match(/^#room=(.+)$/);
    var id = m ? decodeURIComponent(m[1]) : new URLSearchParams(location.search).get('id');
    var i = SITE.rooms.findIndex(function (r) { return r.id === id; });
    if (i < 0) i = 0;
    var r = SITE.rooms[i];

    document.title = r.name + ' — ' + SITE.seo.room.titleSuffix;
    $('#subheroImg').src = r.images[0];
    $('#subheroTitle').textContent = U.roomsPageTitle;
    $('#crumbNow').textContent = r.name;

    /* 이미지 슬라이드 */
    var track = $('#slideTrack'), n = r.images.length, at = 0;
    track.innerHTML = r.images.map(function (src) {
      return '<div><img src="' + esc(src) + '" alt="' + esc(r.name) + '"></div>';
    }).join('');
    var count = $('#slideCount');
    function paint() {
      track.style.transform = 'translateX(' + (-at * 100) + '%)';
      count.textContent = (at + 1) + ' / ' + n;
    }
    $('#slidePrev').addEventListener('click', function () { at = (at - 1 + n) % n; paint(); });
    $('#slideNext').addEventListener('click', function () { at = (at + 1) % n; paint(); });
    track.addEventListener('click', function () { LB.open(r.images, at); });
    paint();

    /* 본문 */
    $('#roomEn').textContent = r.en;
    $('#roomName').textContent = r.name;
    $('#roomDesc').textContent = r.desc;
    $('#roomBook').textContent = U.bookThisRoom;
    $('#specInfo').textContent = r.spec.info;
    $('#specPeople').textContent = r.spec.people;
    $('#specCheck').textContent = r.spec.checkin;
    $('#roomAmenities').innerHTML = r.amenities.map(function (a) {
      return '<li>' + esc(a) + '</li>';
    }).join('');
    $('#roomGrid').innerHTML = r.images.slice(1).map(function (src, k) {
      return '<button type="button" data-i="' + (k + 1) + '" class="ph zoom ratio-43"><img src="' + esc(src) + '" alt=""></button>';
    }).join('');
    $('#roomGrid').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      LB.open(r.images, +b.dataset.i);
    });

    /* 페이지네이션 */
    var prev = SITE.rooms[i - 1], next = SITE.rooms[i + 1];
    $('#allRooms').textContent = U.allRooms;
    $('#roomPrev').innerHTML = prev ? '← ' + esc(prev.name) : '';
    $('#roomPrev').href = prev ? href('room', prev.id) : '#';
    if (!prev) $('#roomPrev').setAttribute('aria-disabled', 'true');
    $('#roomNext').innerHTML = next ? esc(next.name) + ' →' : '';
    $('#roomNext').href = next ? href('room', next.id) : '#';
    if (!next) $('#roomNext').setAttribute('aria-disabled', 'true');

    /* 객실 상세 하단 예약 CTA */
    $('#roomCtaImg').src = SITE.roomCta.img;
    $('#roomCtaTitle').textContent = SITE.roomCta.title;
    $('#roomCtaBook').textContent = U.booking;
    $('#roomCtaGuide').textContent = U.guideLink;
  }

  /* ---------- 9. 이용안내 렌더 ---------- */
  function renderGuide() {
    if (!$('#accList')) return;
    var G = SITE.guide;

    /* 서브 히어로 + 인트로 */
    $('#subheroImg').src = G.subhero.img;
    $('#subheroTitle').textContent = G.subhero.title;
    $('#crumbNow').textContent = G.subhero.title;
    $('#guideEyebrow').textContent = G.intro.eyebrow;
    $('#guideTitle').textContent = G.intro.title;
    $('#guideDesc').textContent = G.intro.desc;

    var rows = function (arr) {
      return '<table class="info-table"><tbody>' + arr.map(function (r) {
        return '<tr><th>' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>';
      }).join('') + '</tbody></table>';
    };
    var rateTable = function (R) {
      var head = '<thead><tr>' + R.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead>';
      var body = '<tbody>' + R.rows.map(function (r) {
        return '<tr>' + r.map(function (c, i) { return i === 0 ? '<th>' + esc(c) + '</th>' : '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody>';
      return '<div class="table-scroll"><table class="rate-table">' + head + body + '</table></div>' +
             (R.note ? '<div class="notice">' + esc(R.note) + '</div>' : '');
    };

    var items = [
      (G.rates && G.rates.rows) ? { t: '객실 요금', body: rateTable(G.rates) } : null,
      (G.account) ? { t: '예약 · 입금 계좌', body: rows(G.account) +
          '<div class="notice">예약 문의·입금은 대표번호로 확인 후 진행해 주세요. 입금자명이 예약자와 다르면 미리 알려 주시면 확인이 빠릅니다.</div>' } : null,
      { t: '입실 · 퇴실', body: rows(G.checkin) },
      { t: '인원 기준 및 추가 요금', body: rows(G.people) },
      { t: '부대시설 이용안내', body: G.facility.map(function (f) {
          return '<h4 class="guide-sub">' + esc(f.name) + '</h4>' + rows(f.rows);
        }).join('') },
      { t: '주차', body: rows(G.parking) },
      { t: '편의시설', body: rows(G.convenience) },
      { t: '환불 규정', body: rows(G.refund) +
          '<div class="notice">환불 기준일은 <strong>입실일</strong>을 기준으로 산정하며, 성수기 · 연휴 기간에는 별도 규정이 적용될 수 있습니다. 예약은 외부 예약 시스템을 통해 이루어지므로, 취소 · 환불 역시 해당 시스템의 정책을 함께 확인해 주세요.</div>' },
      { t: '펜션 정책', body: '<ul class="bullets">' + G.policy.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' }
    ];

    $('#accList').innerHTML = items.filter(Boolean).map(function (it, i) {
      return '<div class="acc__item' + (i === 0 ? ' is-on' : '') + '">' +
        '<button class="acc__btn" type="button"><span>' + esc(it.t) + '</span><span>＋</span></button>' +
        '<div class="acc__body">' + it.body + '</div>' +
      '</div>';
    }).join('');

    $('#guideBook').textContent = U.booking;

    $('#accList').addEventListener('click', function (e) {
      var b = e.target.closest('.acc__btn'); if (!b) return;
      b.parentNode.classList.toggle('is-on');
    });
  }

  /* ---------- 9a. 펜션소개 (about.html) ---------- */
  function renderAbout() {
    if (!$('#aboutImages')) return;
    renderSubhero('about');
    $('#aboutBody').textContent = SITE.about.body;
    $('#aboutImages').innerHTML = SITE.about.images.map(function (src) {
      return '<div class="ph zoom ratio-43"><img src="' + esc(src) + '" alt=""></div>';
    }).join('');
  }

  /* ---------- 9b. 부대시설 (special.html) ---------- */
  function renderSpecial() {
    if (!$('#specialTabs')) return;
    renderSubhero('special');
    var list = SITE.special;
    var id = new URLSearchParams(location.search).get('id');
    var i = list.findIndex(function (s) { return s.no === id; });
    if (i < 0) i = 0;
    var tabs = $('#specialTabs'), panel = $('#specialDetail');

    tabs.innerHTML = list.map(function (s, k) {
      return '<button class="tab' + (k === i ? ' is-on' : '') + '" type="button" data-i="' + k + '">' + esc(s.ko) + '</button>';
    }).join('');

    function paint(k) {
      var s = list[k];
      document.title = s.ko + ' — ' + B.nameKo;
      var imgs = (s.images && s.images.length) ? s.images : [s.img];
      panel.innerHTML =
        '<div class="special-detail__media">' +
          imgs.map(function (src) {
            return '<div class="ph zoom ratio-43"><img src="' + esc(src) + '" alt="' + esc(s.ko) + '"></div>';
          }).join('') +
        '</div>' +
        '<div class="special-detail__txt">' +
          '<div class="special__en">' + esc(s.en) + '</div>' +
          '<h2 class="room-panel__name">' + esc(s.ko) + '</h2>' +
          '<p class="room-panel__desc">' + esc(s.body || s.desc) + '</p>' +
        '</div>';
    }
    paint(i);

    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('.tab'); if (!b) return;
      $$('.tab', tabs).forEach(function (t) { t.classList.remove('is-on'); });
      b.classList.add('is-on');
      paint(+b.dataset.i);
    });
  }

  /* ---------- 9c. 주변여행지 (travel.html) ---------- */
  function renderTravel() {
    if (!$('#travelList')) return;
    renderSubhero('travel');
    $('#travelList').innerHTML = SITE.travel.map(function (t) {
      return '<div class="travel__card">' +
        '<div class="ph zoom"><img src="' + esc(t.img) + '" alt="' + esc(t.name) + '"></div>' +
        '<div class="travel__name">' + esc(t.name) + '</div>' +
        '<div class="travel__meta">' + esc(t.time) + ' · ' + esc(t.dist) + '</div>' +
        '<p class="travel__desc">' + esc(t.desc) + '</p>' +
      '</div>';
    }).join('');
  }

  /* ---------- 9d. 개인정보처리방침 (privacy.html) ---------- */
  function renderPrivacy() {
    if (!$('#privacyBody')) return;
    renderSubhero('privacy');
    var P = SITE.privacy;
    $('#privacyUpdated').textContent = P.updated;
    $('#privacyIntro').textContent = P.intro;
    $('#privacyBody').innerHTML = P.sections.map(function (s) {
      return '<section class="policy__item">' +
        '<h2 class="policy__h">' + esc(s.h) + '</h2>' +
        '<p class="policy__body pre-line">' + esc(s.body) + '</p>' +
      '</section>';
    }).join('');
  }

  /* ---------- 10. 단일 파일 프리뷰 라우터 ---------- */
  function route() {
    if (!ROUTER) return;
    var h = location.hash;
    var view = h.indexOf('#room=') === 0 ? 'room' : (h === '#guide' ? 'guide' : 'home');
    ['home', 'room', 'guide'].forEach(function (v) {
      var el = document.getElementById('view-' + v);
      if (el) el.hidden = (v !== view);
    });
    document.body.id = 'page-' + view;
    var header = $('.header');
    if (header) header.classList.toggle('header--sub', view !== 'home');
    document.body.classList.remove('is-menu');
    window.scrollTo(0, 0);
    if (view === 'room') renderRoom();
    $$('.fadeup').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 11. 부트 ---------- */
  function boot() {
    applySeo();
    renderHeader();
    renderFooter();
    renderFloating();
    renderSectionHeads();   // [data-sec] 섹션 헤더 (메인·서브 공통)
    renderHome();
    renderRoom();
    renderGuide();
    renderAbout();
    renderSpecial();
    renderTravel();
    renderPrivacy();
    injectCta();
    renderPopup();
    initFadeUp();
    // 예약 링크 일괄 주입
    $$('[data-booking]').forEach(function (a) {
      a.href = B.booking; a.target = '_blank'; a.rel = 'noopener';
    });
    // 단일 파일 프리뷰: 인라인 이미지 주입
    if (typeof PH !== 'undefined') {
      $$('img[data-ph]').forEach(function (i) { i.src = PH; });
    }
    if (ROUTER) { route(); window.addEventListener('hashchange', route); }
  }

  /* ---------- 12. Firebase 콘텐츠 오버레이 (공개 페이지, SDK 없이 REST 읽기) ----------
     관리자 페이지에서 저장한 수정본(site/content.json)을 기본값(SITE) 위에 덮어씀. */
  var FB_PROJECT = 'mongsanpo-pension';
  function deepMerge(t, s) {
    for (var k in s) {
      var v = s[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && t[k] && typeof t[k] === 'object' && !Array.isArray(t[k])) deepMerge(t[k], v);
      else t[k] = v;
    }
    return t;
  }
  function loadOverrides() {
    if (typeof fetch !== 'function') return Promise.resolve();
    var url = 'https://firestore.googleapis.com/v1/projects/' + FB_PROJECT + '/databases/(default)/documents/site/content';
    return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (doc) {
      if (doc && doc.fields && doc.fields.json && doc.fields.json.stringValue) {
        try { deepMerge(SITE, JSON.parse(doc.fields.json.stringValue)); } catch (e) {}
      }
    }).catch(function () {});
  }
  function start() {
    var done = false, go = function () { if (done) return; done = true; boot(); };
    loadOverrides().then(go, go);
    setTimeout(go, 2500); // 안전장치: 네트워크 지연 시에도 기본값으로 렌더
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
