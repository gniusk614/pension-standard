/* ==========================================================================
   몽산포 휴일펜션 — 관리자 로직
   로그인(Auth) → 기본값(SITE)+수정본(Firestore) 편집 → 사진 업로드(Storage) → 저장
   저장 형식: Firestore  site/content  = { json: "<수정본 JSON>", updatedAt }
   ========================================================================== */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  firebase.initializeApp(FIREBASE_CONFIG);
  var auth = firebase.auth();
  var db = firebase.firestore();
  var storage = firebase.storage();

  var DEFAULT = SITE;          // content.js 의 기본값
  var data = null;             // 편집 중인 작업본

  /* ---------- 유틸 ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function imgSrc(u) { return (!u ? '' : (/^https?:|^data:/.test(u) ? u : '../' + u)); }
  function pick(o, keys) { var r = {}; keys.forEach(function (k) { r[k] = o ? o[k] : undefined; }); return r; }
  function setMsg(id, text, cls) { var e = $('#' + id); if (!e) return; e.textContent = text || ''; e.className = 'msg' + (cls ? ' ' + cls : ''); }

  /* 편집 대상 subset 만 추출 */
  function editableFrom(s) {
    return {
      brand: pick(s.brand, ['tel', 'telHref', 'booking']),
      popup: { use: !!s.popup.use, img: s.popup.img || '', link: s.popup.link || '#' },
      sections: { hero: { title: s.sections.hero.title }, about: { title: s.sections.about.title } },
      hero: { slides: (s.hero.slides || []).slice() },
      about: { body: s.about.body, images: (s.about.images || []).slice() },
      rooms: (s.rooms || []).map(function (r) {
        return { id: r.id, label: r.label, en: r.en, name: r.name, desc: r.desc,
          spec: { info: r.spec.info, people: r.spec.people, checkin: r.spec.checkin },
          amenities: (r.amenities || []).slice(), images: (r.images || []).slice() };
      }),
      special: (s.special || []).map(function (x) {
        return { no: x.no, en: x.en, ko: x.ko, img: x.img, desc: x.desc, body: x.body, images: (x.images || []).slice() };
      }),
      travel: (s.travel || []).map(function (t) {
        return { name: t.name, time: t.time, dist: t.dist, desc: t.desc, img: t.img || '', credit: t.credit || '' };
      }),
      gallery: (s.gallery || []).slice(),
      cta: { title: s.cta.title, desc: s.cta.desc }
    };
  }
  function deepMerge(t, s) {
    for (var k in s) { var v = s[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && t[k] && typeof t[k] === 'object' && !Array.isArray(t[k])) deepMerge(t[k], v);
      else t[k] = v;
    } return t;
  }

  /* ---------- 인증 ---------- */
  var appReady = false;
  function showApp(user) {
    $('#login').hidden = true; $('#app').hidden = false;
    $('#who').textContent = user ? user.email : '';
    if (appReady) return; appReady = true;
    loadContent();
  }
  // 저장 방식: 인앱 브라우저(카톡 등)에서 IndexedDB 저장이 막혀 로그인이 멈추는 것을 방지.
  // 세션(sessionStorage) 우선 → 실패 시 메모리(NONE)로. IndexedDB(LOCAL) 는 쓰지 않음.
  try {
    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .catch(function () { return auth.setPersistence(firebase.auth.Auth.Persistence.NONE); })
      .catch(function () {});
  } catch (e) {}
  auth.onAuthStateChanged(function (user) {
    if (user) showApp(user);
    else { appReady = false; $('#app').hidden = true; $('#login').hidden = false; }
  });
  try { var _lp = document.querySelector('.login-card p'); if (_lp) _lp.textContent = '등록된 관리자 계정으로 로그인하세요. (v16)'; } catch (e) {}
  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = $('#loginForm button[type=submit]');
    btn.disabled = true;
    var settled = false;
    var step = function (t, cls) { setMsg('loginMsg', t, cls || ''); };
    step('① 인증 요청 중…');
    var timer = setTimeout(function () {
      if (settled) return; settled = true; btn.disabled = false;
      step('⏱ 인증 서버 응답이 없습니다. 사파리·크롬(카톡 인앱 아님)으로 열거나, 네트워크(LTE↔WiFi)를 바꿔 다시 시도해 주세요.', 'err');
    }, 12000);
    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .catch(function () { return auth.setPersistence(firebase.auth.Auth.Persistence.NONE); })
      .catch(function () {})
      .then(function () {
        return auth.signInWithEmailAndPassword($('#email').value.trim(), $('#password').value);
      })
      .then(function (cred) {
        if (settled) return; settled = true; clearTimeout(timer);
        step('② 인증 성공 · 화면 여는 중…');
        showApp(cred && cred.user);
      })
      .catch(function (err) {
        if (settled) return; settled = true; clearTimeout(timer); btn.disabled = false;
        var code = (err && (err.code || err.message)) || String(err);
        var friendly = (code === 'auth/invalid-credential' || code === 'auth/wrong-password' ||
                        code === 'auth/user-not-found' || code === 'auth/invalid-email')
          ? '이메일 또는 비밀번호가 올바르지 않습니다.' : ('로그인 실패 [' + code + ']');
        step(friendly, 'err');
      });
  });
  $('#logout').addEventListener('click', function () { auth.signOut(); });

  /* ---------- 콘텐츠 로드 ---------- */
  function loadContent() {
    $('#saveMsg').textContent = '불러오는 중…';
    db.collection('site').doc('content').get().then(function (snap) {
      var ov = {};
      if (snap.exists && snap.data() && snap.data().json) { try { ov = JSON.parse(snap.data().json); } catch (e) {} }
      data = deepMerge(editableFrom(DEFAULT), ov);
      renderTabs(); renderAll();
      $('#saveMsg').textContent = '변경 후 저장을 눌러야 사이트에 반영됩니다.';
    }).catch(function (err) {
      $('#saveMsg').textContent = '불러오기 실패: ' + (err.message || err);
    });
  }

  /* ---------- 탭 ---------- */
  var TABS = [
    ['basic', '기본 정보'], ['popup', '팝업'], ['hero', '히어로'], ['about', '소개'],
    ['rooms', '객실'], ['special', '부대시설'], ['travel', '주변여행지'], ['gallery', '갤러리'], ['cta', '예약 배너']
  ];
  function renderTabs() {
    $('#tabs').innerHTML = TABS.map(function (t, i) {
      return '<button class="tab' + (i === 0 ? ' is-on' : '') + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
    }).join('');
    $('#panels').innerHTML = TABS.map(function (t, i) {
      return '<div class="panel' + (i === 0 ? ' is-on' : '') + '" id="panel-' + t[0] + '"></div>';
    }).join('');
    $('#tabs').addEventListener('click', function (e) {
      var b = e.target.closest('.tab'); if (!b) return;
      $$('.tab').forEach(function (x) { x.classList.remove('is-on'); });
      $$('.panel').forEach(function (x) { x.classList.remove('is-on'); });
      b.classList.add('is-on');
      $('#panel-' + b.dataset.tab).classList.add('is-on');
    });
  }

  /* ---------- 폼 헬퍼 ---------- */
  // 텍스트/textarea 입력을 obj[key] 에 바인딩
  function fieldRow(label, obj, key, multiline) {
    var id = 'f_' + Math.random().toString(36).slice(2);
    var tag = multiline ? '<textarea id="' + id + '"></textarea>' : '<input type="text" id="' + id + '">';
    var wrap = document.createElement('div'); wrap.className = 'row';
    wrap.innerHTML = '<label>' + label + '</label>' + tag;
    var input = $('#' + id, wrap);
    input.value = (obj[key] == null ? '' : obj[key]);
    input.addEventListener('input', function () { obj[key] = input.value; });
    return wrap;
  }

  // 이미지 리스트 위젯: arr(배열 참조)를 편집. prefix = 업로드 파일명 접두.
  function imageList(arr, prefix, onFirstChange) {
    var host = document.createElement('div'); host.className = 'imgs';
    function draw() {
      host.innerHTML = '';
      arr.forEach(function (u, idx) {
        var cell = document.createElement('div'); cell.className = 'imgcell';
        cell.innerHTML = '<img src="' + imgSrc(u) + '" alt=""><div class="imgcell__bar">' +
          '<button class="rep">교체</button><button class="del">삭제</button></div>';
        $('.rep', cell).addEventListener('click', function () {
          upload(prefix, function (url) { arr[idx] = url; if (onFirstChange) onFirstChange(); draw(); });
        });
        $('.del', cell).addEventListener('click', function () {
          arr.splice(idx, 1); if (onFirstChange) onFirstChange(); draw();
        });
        host.appendChild(cell);
      });
      var add = document.createElement('button'); add.type = 'button'; add.className = 'imgadd';
      add.textContent = '+ 사진 추가';
      add.addEventListener('click', function () {
        upload(prefix, function (url) { arr.push(url); if (onFirstChange) onFirstChange(); draw(); });
      });
      host.appendChild(add);
    }
    draw();
    return host;
  }

  // 파일 선택 → Storage 업로드 → cb(다운로드URL)
  function upload(prefix, cb) {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.addEventListener('change', function () {
      var file = inp.files && inp.files[0]; if (!file) return;
      var name = 'uploads/' + prefix + '-' + Date.now() + '-' + file.name.replace(/[^\w.\-]/g, '_');
      $('#uploading').classList.add('is-on');
      var ref = storage.ref().child(name);
      ref.put(file).then(function () { return ref.getDownloadURL(); })
        .then(function (url) { $('#uploading').classList.remove('is-on'); cb(url); })
        .catch(function (err) {
          $('#uploading').classList.remove('is-on');
          alert('업로드 실패: ' + (err.code || err.message) + '\n(사진 업로드는 Firebase Storage + Blaze 요금제가 필요합니다.)');
        });
    });
    inp.click();
  }

  function card(title, hint) {
    var c = document.createElement('div'); c.className = 'card';
    c.innerHTML = '<h2>' + title + '</h2>' + (hint ? '<p class="hint">' + hint + '</p>' : '');
    return c;
  }
  function sub(el, text) { var h = document.createElement('h3'); h.textContent = text; el.appendChild(h); }
  function imgBlock(el, labelText, arr, prefix, onFirstChange) {
    var l = document.createElement('label'); l.style.cssText = 'display:block;font-size:12px;font-weight:700;color:var(--ink-2);margin:12px 0 6px'; l.textContent = labelText;
    el.appendChild(l); el.appendChild(imageList(arr, prefix, onFirstChange));
  }

  /* ---------- 각 패널 렌더 ---------- */
  function renderAll() {
    renderBasic(); renderPopup(); renderHero(); renderAbout();
    renderRooms(); renderSpecial(); renderTravel(); renderGallery(); renderCta();
  }

  // 단일 이미지 위젯 (obj[key] = 이미지 1장)
  function singleImage(obj, key, prefix) {
    var host = document.createElement('div'); host.className = 'imgs';
    function draw() {
      host.innerHTML = '';
      if (obj[key]) {
        var cell = document.createElement('div'); cell.className = 'imgcell';
        cell.innerHTML = '<img src="' + imgSrc(obj[key]) + '"><div class="imgcell__bar"><button class="rep">교체</button><button class="del">삭제</button></div>';
        $('.rep', cell).addEventListener('click', function () { upload(prefix, function (u) { obj[key] = u; draw(); }); });
        $('.del', cell).addEventListener('click', function () { obj[key] = ''; draw(); });
        host.appendChild(cell);
      } else {
        var add = document.createElement('button'); add.type = 'button'; add.className = 'imgadd'; add.textContent = '+ 사진 추가';
        add.addEventListener('click', function () { upload(prefix, function (u) { obj[key] = u; draw(); }); });
        host.appendChild(add);
      }
    }
    draw();
    return host;
  }

  function renderTravel() {
    var p = $('#panel-travel'); p.innerHTML = '';
    var c = card('주변여행지', '카드별 이름·소요시간·거리·설명·사진을 관리합니다. 사진이 없으면 빈 칸으로 보입니다.');
    data.travel.forEach(function (t, i) {
      var b = document.createElement('div'); b.className = 'roomblock';
      var tt = document.createElement('div'); tt.className = 'rb-title'; tt.textContent = (i + 1) + '. ' + (t.name || ''); b.appendChild(tt);
      b.appendChild(fieldRow('장소 이름', t, 'name'));
      var g = document.createElement('div'); g.className = 'grid2';
      g.appendChild(fieldRow('소요시간 (예: 차량 약 10분)', t, 'time'));
      g.appendChild(fieldRow('거리 (예: 약 6km)', t, 'dist'));
      b.appendChild(g);
      b.appendChild(fieldRow('설명', t, 'desc', true));
      b.appendChild(fieldRow('사진 출처 표기 (선택)', t, 'credit'));
      var l = document.createElement('label'); l.style.cssText = 'display:block;font-size:12px;font-weight:700;color:var(--ink-2);margin:12px 0 6px'; l.textContent = '사진';
      b.appendChild(l); b.appendChild(singleImage(t, 'img', 'travel-' + (i + 1)));
      c.appendChild(b);
    });
    p.appendChild(c);
  }

  function renderBasic() {
    var p = $('#panel-basic'); p.innerHTML = '';
    var c = card('기본 정보', '대표번호와 실시간예약 링크입니다. 예약 링크에 네이버 예약 주소를 넣으면 모든 “실시간예약” 버튼이 연결됩니다.');
    var telRow = fieldRow('대표 전화번호 (예: 010-1234-5678)', data.brand, 'tel');
    $('input', telRow).addEventListener('input', function () { data.brand.telHref = 'tel:' + this.value.replace(/[^0-9+]/g, ''); });
    c.appendChild(telRow);
    c.appendChild(fieldRow('실시간예약 링크 (네이버예약 등 URL)', data.brand, 'booking'));
    p.appendChild(c);
  }

  function renderPopup() {
    var p = $('#panel-popup'); p.innerHTML = '';
    var c = card('메인 팝업', '홈페이지 첫 화면에 뜨는 공지 팝업입니다.');
    var ck = document.createElement('div'); ck.className = 'check';
    ck.innerHTML = '<input type="checkbox" id="popUse"><label for="popUse">팝업 사용(켜기)</label>';
    $('#popUse', ck).checked = !!data.popup.use;
    $('#popUse', ck).addEventListener('change', function () { data.popup.use = this.checked; });
    c.appendChild(ck);
    c.appendChild(fieldRow('클릭 시 이동할 링크 (없으면 # )', data.popup, 'link'));
    sub(c, '팝업 이미지');
    var arr = { get v() { return data.popup.img; } };
    // 단일 이미지 위젯
    var host = document.createElement('div'); host.className = 'imgs';
    function drawOne() {
      host.innerHTML = '';
      if (data.popup.img) {
        var cell = document.createElement('div'); cell.className = 'imgcell';
        cell.innerHTML = '<img src="' + imgSrc(data.popup.img) + '"><div class="imgcell__bar"><button class="rep">교체</button><button class="del">삭제</button></div>';
        $('.rep', cell).addEventListener('click', function () { upload('popup', function (u) { data.popup.img = u; drawOne(); }); });
        $('.del', cell).addEventListener('click', function () { data.popup.img = ''; drawOne(); });
        host.appendChild(cell);
      } else {
        var add = document.createElement('button'); add.type = 'button'; add.className = 'imgadd'; add.textContent = '+ 팝업 이미지 업로드';
        add.addEventListener('click', function () { upload('popup', function (u) { data.popup.img = u; drawOne(); }); });
        host.appendChild(add);
      }
    }
    drawOne(); c.appendChild(host);
    p.appendChild(c);
  }

  function renderHero() {
    var p = $('#panel-hero'); p.innerHTML = '';
    var c = card('히어로 (첫 화면)', '첫 화면 큰 문구와 배경 슬라이드 사진입니다. 문구 줄바꿈은 Enter.');
    c.appendChild(fieldRow('메인 문구', data.sections.hero, 'title', true));
    imgBlock(c, '배경 슬라이드 사진 (여러 장 순환)', data.hero.slides, 'hero');
    p.appendChild(c);
  }

  function renderAbout() {
    var p = $('#panel-about'); p.innerHTML = '';
    var c = card('펜션 소개', '소개 섹션의 제목과 본문, 사진입니다.');
    c.appendChild(fieldRow('소개 제목', data.sections.about, 'title', true));
    c.appendChild(fieldRow('소개 본문', data.about, 'body', true));
    imgBlock(c, '소개 사진', data.about.images, 'about');
    p.appendChild(c);
  }

  function renderRooms() {
    var p = $('#panel-rooms'); p.innerHTML = '';
    var c = card('객실', '각 객실의 이름·소개·정보·사진을 수정합니다.');
    data.rooms.forEach(function (r) {
      var b = document.createElement('div'); b.className = 'roomblock';
      var t = document.createElement('div'); t.className = 'rb-title'; t.textContent = r.label + ' 객실'; b.appendChild(t);
      b.appendChild(fieldRow('객실 이름', r, 'name'));
      b.appendChild(fieldRow('소개 문구', r, 'desc', true));
      var g = document.createElement('div'); g.className = 'grid2';
      g.appendChild(fieldRow('구성 (예: 1층 · 원룸형 · 취사 가능)', r.spec, 'info'));
      g.appendChild(fieldRow('인원 (예: 기준 2인 / 최대 4인)', r.spec, 'people'));
      b.appendChild(g);
      b.appendChild(fieldRow('입실/퇴실 (예: 15:00 / 11:00)', r.spec, 'checkin'));
      // 구비품목 (줄바꿈 구분)
      var am = { text: r.amenities.join('\n') };
      var amRow = fieldRow('구비품목 (한 줄에 하나)', am, 'text', true);
      $('textarea', amRow).addEventListener('input', function () {
        r.amenities = this.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      });
      b.appendChild(amRow);
      imgBlock(b, '객실 사진', r.images, 'room-' + r.label);
      c.appendChild(b);
    });
    p.appendChild(c);
  }

  function renderSpecial() {
    var p = $('#panel-special'); p.innerHTML = '';
    var c = card('부대시설', '부대시설 항목의 이름·설명·사진을 수정합니다.');
    data.special.forEach(function (x) {
      var b = document.createElement('div'); b.className = 'roomblock';
      b.appendChild(fieldRow('시설 이름', x, 'ko'));
      b.appendChild(fieldRow('한 줄 설명 (목록용)', x, 'desc'));
      b.appendChild(fieldRow('상세 설명', x, 'body', true));
      imgBlock(b, '시설 사진', x.images, 'special-' + (x.no || x.ko), function () { x.img = x.images[0] || x.img; });
      c.appendChild(b);
    });
    p.appendChild(c);
  }

  function renderGallery() {
    var p = $('#panel-gallery'); p.innerHTML = '';
    var c = card('갤러리', '메인 갤러리에 노출되는 사진입니다.');
    imgBlock(c, '갤러리 사진', data.gallery, 'gallery');
    p.appendChild(c);
  }

  function renderCta() {
    var p = $('#panel-cta'); p.innerHTML = '';
    var c = card('예약 배너', '메인 하단 예약 유도 배너 문구입니다.');
    c.appendChild(fieldRow('배너 제목', data.cta, 'title', true));
    c.appendChild(fieldRow('배너 설명', data.cta, 'desc'));
    p.appendChild(c);
  }

  /* ---------- 저장 / 되돌리기 ---------- */
  $('#save').addEventListener('click', function () {
    $('#save').disabled = true; $('#saveMsg').textContent = '저장 중…';
    db.collection('site').doc('content').set({
      json: JSON.stringify(data),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      $('#saveMsg').textContent = '✓ 저장됨 — 사이트에 반영되었습니다.';
    }).catch(function (err) {
      $('#saveMsg').textContent = '저장 실패: ' + (err.code || err.message);
    }).then(function () { $('#save').disabled = false; });
  });
  $('#reload').addEventListener('click', function () {
    if (confirm('저장하지 않은 변경을 버리고 다시 불러올까요?')) loadContent();
  });
})();
