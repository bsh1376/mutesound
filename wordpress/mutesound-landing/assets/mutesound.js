(function () {
  "use strict";

  var PLACEHOLDER_SLIDE = 'background-image:repeating-linear-gradient(45deg,#e0e3e5 0 13px,#eceef0 13px 26px);';
  var PLACEHOLDER_THUMB = 'background-image:repeating-linear-gradient(45deg,#e0e3e5 0 6px,#eceef0 6px 12px);';
  var THUMBS_PER_PAGE = 5;
  var ASSET_BASE = window.MUTESOUND_ASSET_BASE || '';
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function assetUrl(path) {
    if (!path || /^(https?:|data:|\/)/.test(path)) return path;
    return ASSET_BASE + path;
  }

  var casesData = [
    { t: '강동 실용음악학원', loc: '서울 강동', photos: ['드럼 연습실', '피아노 존', '레코딩 존', '드럼 연습실 2', '학원 전경'], imgs: ['uploads/KakaoTalk_20260630_152050623.jpg','uploads/KakaoTalk_20260630_152050623_01.jpg','uploads/KakaoTalk_20260630_152050623_02.jpg','uploads/KakaoTalk_20260630_152050623_03.jpg','uploads/KakaoTalk_20260630_152050623_04.jpg'] },
    { t: '수원 코드브릿지 실용음악학원', loc: '경기 수원', photos: ['레코딩 부스', '합주실', '프로덕션 룸', '연습실 1', '피아노 연습실', '연습실 2', '레슨 룸', '라운지'], imgs: ['uploads/KakaoTalk_20260630_142350106-566d8603.jpg','uploads/KakaoTalk_20260630_142350106_02-79d2ac7b.jpg','uploads/KakaoTalk_20260630_142350106_03-ac10e404.jpg','uploads/KakaoTalk_20260630_142350106_04-8fe7cccb.jpg','uploads/KakaoTalk_20260630_142350106_06-69752fec.jpg','uploads/KakaoTalk_20260630_142350106_08-b0c5d37f.jpg','uploads/KakaoTalk_20260630_142350106_09-1df66e1e.jpg','uploads/KakaoTalk_20260630_142350106_10-8af7c9a6.jpg'] },
    { t: '까치산 음악연습실', loc: '서울 강서', photos: ['복도 전경 1', '사인보드', '복도 2', '복도 3', '복도 아트', '복도 4', '로커존', '연습실 다크', '연습실 베이지 LED', '연습실 도어', '복도 5', '연습실 내부', '대기 공간', '연습실 LED', '복도 6'], imgs: ['uploads/KakaoTalk_20260630_154654133.jpg','uploads/KakaoTalk_20260630_154654133_01.jpg','uploads/KakaoTalk_20260630_154654133_02.jpg','uploads/KakaoTalk_20260630_154654133_03.jpg','uploads/KakaoTalk_20260630_154654133_05.jpg','uploads/KakaoTalk_20260630_154654133_06.jpg','uploads/KakaoTalk_20260630_154654133_07.jpg','uploads/KakaoTalk_20260630_154654133_10.jpg','uploads/KakaoTalk_20260630_154654133_11.jpg','uploads/KakaoTalk_20260630_154654133_12.jpg','uploads/KakaoTalk_20260630_154654133_13.jpg','uploads/KakaoTalk_20260630_154654133_14.jpg','uploads/KakaoTalk_20260630_154654133_15.jpg','uploads/KakaoTalk_20260630_154654133_16.jpg','uploads/KakaoTalk_20260630_154654133_17.jpg'] },
    { t: '다산 댄스학원', loc: '경기 남양주', photos: ['리셉션', '간접조명 1', '거울 연습실', '핑크 LED', '흡음 패널', '내부 전경 1', '내부 전경 2'], imgs: ['uploads/KakaoTalk_20260630_141438270.jpg','uploads/KakaoTalk_20260630_141438270_01.jpg','uploads/KakaoTalk_20260630_141438270_02.jpg','uploads/KakaoTalk_20260630_141438270_03.jpg','uploads/KakaoTalk_20260630_141438270_04.jpg','uploads/KakaoTalk_20260630_141438270_05.jpg','uploads/KakaoTalk_20260630_141438270_06.jpg'] },
    { t: '상왕십리 순수드럼', loc: '서울 성동', photos: ['드럼 부스 전경', 'EFNOTE 컨트롤러', '드럼 패드', '연습실 전경', '드럼 세트', '드럼 부스 2', '옐로우 드럼', '휴게 공간', '통로'], imgs: ['uploads/KakaoTalk_20260630_155149554.jpg','uploads/KakaoTalk_20260630_155149554_01.jpg','uploads/KakaoTalk_20260630_155149554_02.jpg','uploads/KakaoTalk_20260630_155149554_03.jpg','uploads/KakaoTalk_20260630_155149554_04.jpg','uploads/KakaoTalk_20260630_155149554_07.jpg','uploads/KakaoTalk_20260630_155149554_08.jpg','uploads/KakaoTalk_20260630_155149554_09.jpg','uploads/KakaoTalk_20260630_155149554_10.jpg'] },
    { t: '쌍문 기타학원', loc: '서울 도봉', photos: ['라운지', '연습실 1', '휴게 공간', '연습실 2', '연습실 3', '탈의 공간', '드럼 연습실'], imgs: ['uploads/KakaoTalk_20260630_140740497.jpg','uploads/KakaoTalk_20260630_140740497_01.jpg','uploads/KakaoTalk_20260630_140740497_02.jpg','uploads/KakaoTalk_20260630_140740497_03.jpg','uploads/KakaoTalk_20260630_140740497_04.jpg','uploads/KakaoTalk_20260630_140740497_05.jpg','uploads/KakaoTalk_20260630_140740497_06.jpg'] },
    { t: '양평 댄스학원', loc: '경기 양평', photos: ['댄스 스튜디오 입구', '사무 공간', '댄스 스튜디오 2', '대기 공간', '상담실', '상담실 내부', 'Dance Studio 사인', 'Dance Studio 클로즈업', '댄스 아카데미 홀'], imgs: ['uploads/KakaoTalk_20260630_151833373.jpg','uploads/KakaoTalk_20260630_151833373_01.jpg','uploads/KakaoTalk_20260630_151833373_02.jpg','uploads/KakaoTalk_20260630_151833373_03.jpg','uploads/KakaoTalk_20260630_151833373_04.jpg','uploads/KakaoTalk_20260630_151833373_05.jpg','uploads/KakaoTalk_20260630_151833373_06.jpg','uploads/KakaoTalk_20260630_151833373_07.jpg','uploads/KakaoTalk_20260630_151833373_08.jpg'] },
    { t: '제니윤 바이올린', loc: '경기 성남', photos: ['작업 공간', '바이올린 랙', 'JENNY YUN VIOLIN 사인', '유튜브 골드버튼', '벽면 마감재', 'JENNY YUN 사인 2', '거울 연습실', 'JENNY YUN 3'], imgs: ['uploads/KakaoTalk_20260630_152200392.jpg','uploads/KakaoTalk_20260630_152200392_01.jpg','uploads/KakaoTalk_20260630_152200392_02.jpg','uploads/KakaoTalk_20260630_152200392_04.jpg','uploads/KakaoTalk_20260630_152200392_05.jpg','uploads/KakaoTalk_20260630_152200392_07.jpg','uploads/KakaoTalk_20260630_152200392_08.jpg','uploads/KakaoTalk_20260630_152200392_10.jpg'] },
    { t: '클라우딘 뮤직', loc: '경기 성남', photos: ['복도', '라운지', '연습실 전경', '휴게 라운지', '창가 좌석', '악기존', '복도 2', '레슨실'], imgs: ['uploads/KakaoTalk_20260630_154759333_04.jpg','uploads/KakaoTalk_20260630_154759333_05.jpg','uploads/KakaoTalk_20260630_154759333_07.jpg','uploads/KakaoTalk_20260630_154759333_08.jpg','uploads/KakaoTalk_20260630_154759333_10.jpg','uploads/KakaoTalk_20260630_154759333_11.jpg','uploads/KakaoTalk_20260630_154759333_14.jpg','uploads/KakaoTalk_20260630_154759333_18.jpg'] },
    { t: '파주 운정 PMP드럼학원', loc: '경기 파주', photos: ['드럼 부스 1', '드럼 부스 2', '드럼 부스 3', '연습실 패드존', 'PMP 로고', '식물 인테리어'], imgs: ['uploads/KakaoTalk_20260630_142607402.jpg','uploads/KakaoTalk_20260630_142607402_01.jpg','uploads/KakaoTalk_20260630_142607402_02.jpg','uploads/KakaoTalk_20260630_142607402_03.jpg','uploads/KakaoTalk_20260630_142607402_04.jpg','uploads/KakaoTalk_20260630_142607402_05.jpg'] },
    { t: '피바디 피아노스튜디오', loc: '서울 성동', photos: ['스튜디오 사인·그랜드피아노', '입구 사인', '레슨룸 전경', '레슨룸 클로즈업', '자격증 벽면', '십자가 디테일', '교실 공간', '조명 디테일'], imgs: ['uploads/KakaoTalk_20260630_151750039.jpg','uploads/KakaoTalk_20260630_151750039_01.jpg','uploads/KakaoTalk_20260630_151750039_02.jpg','uploads/KakaoTalk_20260630_151750039_03.jpg','uploads/KakaoTalk_20260630_151750039_04.jpg','uploads/KakaoTalk_20260630_151750039_05.jpg','uploads/KakaoTalk_20260630_151750039_06.jpg','uploads/KakaoTalk_20260630_151750039_07.jpg'] },
    { t: '현 실용음악학원', loc: '인천 계양', photos: ['업라이트 피아노·로고', '악기존', '외부 입구', '복도 전경', '그랜드피아노룸', '복도 2', '레슨룸', '멀티미디어룸', '로비 인테리어'], imgs: ['uploads/KakaoTalk_20260630_152338902.jpg','uploads/KakaoTalk_20260630_152338902_01.jpg','uploads/KakaoTalk_20260630_152338902_02.jpg','uploads/KakaoTalk_20260630_152338902_04.jpg','uploads/KakaoTalk_20260630_152338902_05.jpg','uploads/KakaoTalk_20260630_152338902_07.jpg','uploads/KakaoTalk_20260630_152338902_08.jpg','uploads/KakaoTalk_20260630_152338902_12.jpg','uploads/KakaoTalk_20260630_152338902_15.jpg'] },
    { t: '제이톤댄스', loc: '경기 성남', photos: ['창호 디테일', '비상구 도어', '대기 공간', '탈의실·원장실', '휴게 라운지'], imgs: ['uploads/KakaoTalk_20260630_141100539.jpg','uploads/KakaoTalk_20260630_141100539_02.jpg','uploads/KakaoTalk_20260630_141100539_03.jpg','uploads/KakaoTalk_20260630_141100539_04.jpg','uploads/KakaoTalk_20260630_141100539_05.jpg'] }
  ];

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---- CASE CARDS ----
  var caseGrid = document.getElementById('caseGrid');
  var caseState = casesData.map(function () { return { active: 0, page: 0, loaded: false, visible: false }; });

  casesData.forEach(function (c, i) {
    var n = c.photos.length;
    var st = caseState[i];
    var card = document.createElement('div');
    card.dataset.idx = i;
    card.style.cssText = 'border:1px solid #c6c6cd; border-radius:2px; overflow:hidden; background:#f7f9fb; display:flex; flex-direction:column;';

    var viewport = document.createElement('div');
    viewport.className = 'case-viewport';
    viewport.style.cssText = 'position:relative; aspect-ratio:4/3; overflow:hidden; background:#e0e3e5;';

    // Slides start as lightweight placeholders; real images are attached on demand.
    var track = document.createElement('div');
    var slideEls = [];
    for (var j = 0; j < n; j++) {
      var sl = document.createElement('div');
      sl.style.cssText = 'width:' + (100 / n) + '%; height:100%; flex-shrink:0; background-size:cover; background-position:center; ' + PLACEHOLDER_SLIDE;
      track.appendChild(sl);
      slideEls.push(sl);
    }
    if (c.imgs && c.imgs[0]) {
      slideEls[0].style.backgroundImage = "url('" + assetUrl(c.imgs[0]) + "')";
    }

    var label = document.createElement('span');
    label.style.cssText = 'position:absolute; bottom:12px; right:12px; font-size:11px; color:#76777d; background:rgba(247,249,251,0.85); padding:4px 10px; border-radius:2px; letter-spacing:0.04em;';

    viewport.appendChild(track);
    viewport.appendChild(label);

    var thumbRow = document.createElement('div');
    thumbRow.style.cssText = 'display:flex; align-items:center; gap:6px; padding:10px 12px 0;';

    var pageLabel = document.createElement('div');
    pageLabel.style.cssText = 'text-align:center; font-size:11px; color:#8a8a86; margin-top:4px;';

    var meta = document.createElement('div');
    meta.style.cssText = 'padding:16px 20px 20px;';
    meta.innerHTML =
      '<div style="font-size:17px; font-weight:700; color:#191c1e; letter-spacing:-0.01em;">' + esc(c.t) + '</div>' +
      '<div style="margin-top:6px; font-size:13px; color:#76777d; display:flex; align-items:center; gap:6px;">' +
      '<span style="width:4px; height:4px; border-radius:50%; background:#191c1e; display:inline-block;"></span>' + esc(c.loc) + '</div>';

    card.appendChild(viewport);
    card.appendChild(thumbRow);
    card.appendChild(pageLabel);
    card.appendChild(meta);
    caseGrid.appendChild(card);

    function thumbBg(j) {
      return (st.loaded && c.imgs && c.imgs[j])
        ? "background-image:url('" + assetUrl(c.imgs[j]) + "'); background-size:cover; background-position:center;"
        : PLACEHOLDER_THUMB;
    }

    function loadImages() {
      if (st.loaded) return;
      st.loaded = true;
      slideEls.forEach(function (sl, j) {
        if (c.imgs && c.imgs[j]) sl.style.backgroundImage = "url('" + assetUrl(c.imgs[j]) + "')";
      });
      render();
    }

    function arrowBtn(dir) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', dir === 'prev' ? '이전 사진 묶음' : '다음 사진 묶음');
      btn.style.cssText = 'flex-shrink:0; width:32px; height:32px; border-radius:2px; border:1px solid #c6c6cd; display:flex; align-items:center; justify-content:center; cursor:pointer; background:#f7f9fb; padding:0;';
      btn.innerHTML = dir === 'prev'
        ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#45464d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>'
        : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#45464d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
      return btn;
    }

    function render() {
      var active = ((st.active % n) + n) % n;
      var totalPages = Math.ceil(n / THUMBS_PER_PAGE);
      var showPager = totalPages > 1;
      var page = Math.min(st.page, totalPages - 1);
      if (page < 0) page = 0;
      var pageStart = page * THUMBS_PER_PAGE;

      track.style.cssText = 'display:flex; height:100%; width:' + (n * 100) + '%; transform:translateX(-' + (active * (100 / n)) + '%); transition:transform 0.6s cubic-bezier(0.4,0,0.2,1);';
      label.textContent = c.photos[active];

      thumbRow.innerHTML = '';
      if (!st.loaded) {
        thumbRow.style.display = 'none';
        pageLabel.style.display = 'none';
        return;
      }
      thumbRow.style.display = 'flex';
      if (showPager) {
        var prev = arrowBtn('prev');
        prev.onclick = function () { st.page = Math.max(0, page - 1); render(); };
        thumbRow.appendChild(prev);
      }
      // Fixed 5-column grid so thumbnail size never depends on how many
      // photos land on the current page (a 3-photo last page would
      // otherwise stretch to fill the row and look bigger than page 1).
      var thumbsWrap = document.createElement('div');
      thumbsWrap.style.cssText = 'flex:1 1 auto; min-width:0; display:grid; grid-template-columns:repeat(' + THUMBS_PER_PAGE + ', 1fr); gap:6px;';
      var slice = c.photos.slice(pageStart, pageStart + THUMBS_PER_PAGE);
      slice.forEach(function (photoLabel, k) {
        var j = pageStart + k;
        var th = document.createElement('button');
        var ring = j === active ? '0 0 0 2px #191c1e' : 'inset 0 0 0 1px #c6c6cd';
        th.type = 'button';
        th.setAttribute('aria-label', c.t + ' - ' + photoLabel + ' 보기');
        th.title = photoLabel;
        th.style.cssText = 'aspect-ratio:1/1; border:0; padding:0; border-radius:2px; cursor:pointer; ' + thumbBg(j) + ' box-shadow:' + ring + '; transition:box-shadow 0.15s;';
        th.onclick = function () { st.active = j; render(); };
        thumbsWrap.appendChild(th);
      });
      thumbRow.appendChild(thumbsWrap);
      if (showPager) {
        var next = arrowBtn('next');
        next.onclick = function () { st.page = Math.min(totalPages - 1, page + 1); render(); };
        thumbRow.appendChild(next);
      }

      if (showPager) {
        pageLabel.style.display = '';
        pageLabel.textContent = (page + 1) + ' / ' + totalPages;
      } else {
        pageLabel.style.display = 'none';
      }
    }

    // Swipe (mobile): drag left/right to change photo.
    var sx = null, sy = null;
    viewport.addEventListener('touchstart', function (e) {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    viewport.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        st.active = dx < 0 ? (st.active + 1) % n : ((st.active - 1) % n + n) % n;
        st.page = Math.floor((((st.active % n) + n) % n) / THUMBS_PER_PAGE);
        render();
      }
      sx = null; sy = null;
    }, { passive: true });

    st.render = render;
    st.load = loadImages;
    render();
  });

  // Lazy-load images + track visibility so only on-screen galleries fetch and animate.
  var cards = caseGrid.children;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var i = +en.target.dataset.idx;
        var st = caseState[i];
        st.visible = en.isIntersecting;
        if (en.isIntersecting) st.load();
      });
    }, { rootMargin: '900px 0px' });
    Array.prototype.forEach.call(cards, function (el) { io.observe(el); });
  } else {
    caseState.forEach(function (st) { st.load(); st.visible = true; });
  }
  caseState.slice(0, 3).forEach(function (st) { st.load(); });

  // Auto-advance only the galleries currently on screen.
  if (!prefersReducedMotion) {
    setInterval(function () {
      caseState.forEach(function (st, i) {
        if (!st.visible) return;
        var n = casesData[i].photos.length;
        st.active = (st.active + 1) % n;
        st.render();
      });
    }, 3000);
  }

  // ---- VIDEO ----
  // Paste any YouTube link here (watch?v=, youtu.be/, shorts/, or embed/ all
  // work) - the ID is extracted automatically and the thumbnail switches from
  // the striped placeholder to the real YouTube thumbnail on its own.
  var videos = [
    { url: 'https://www.youtube.com/watch?v=EONa9JjQjyY' },
    { url: 'https://www.youtube.com/watch?v=Vq5he3fFmoE' },
    { url: 'https://www.youtube.com/watch?v=9WJ-Iswpwyg' },
    { url: 'https://www.youtube.com/shorts/ujhU-f1Ust4' }
  ];

  function extractYouTubeId(url) {
    if (!url) return '';
    var s = String(url).trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s; // bare video ID
    var m = s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : '';
  }

  var videoActive = 0, videoPlaying = false;
  var stage = document.getElementById('videoStage');
  var videoGrid = document.getElementById('videoGrid');
  videoGrid.style.gridTemplateColumns = 'repeat(' + Math.max(videos.length, 1) + ', 1fr)';

  function renderVideo() {
    var act = videos[videoActive] || videos[0];
    var actId = extractYouTubeId(act.url);
    var playing = videoPlaying && !!actId;
    stage.innerHTML = '';
    if (playing) {
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + actId + '?autoplay=1&rel=0';
      iframe.title = 'MUTESOUND 시공 영상';
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; border:0;';
      stage.appendChild(iframe);
    } else {
      var overlay = document.createElement('button');
      var bg = actId ? "background-image:url('https://img.youtube.com/vi/" + actId + "/hqdefault.jpg'); background-size:cover; background-position:center;" : '';
      overlay.type = 'button';
      overlay.setAttribute('aria-label', actId ? '선택한 시공 영상 재생' : 'YouTube 링크가 필요합니다');
      overlay.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; border:0; padding:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; cursor:pointer; background-color:rgba(19,27,46,0.15); ' + bg;
      overlay.innerHTML =
        '<div style="width:72px; height:72px; border-radius:2px; background:rgba(25,28,30,0.88); display:flex; align-items:center; justify-content:center;">' +
        '<div style="width:0; height:0; border-left:22px solid #f7f9fb; border-top:13px solid transparent; border-bottom:13px solid transparent; margin-left:5px;"></div></div>' +
        (!actId ? '<span style="font-size:12px; letter-spacing:0.04em; color:#45464d; background:rgba(247,249,251,0.9); padding:6px 14px; border-radius:2px;">YouTube 링크를 연결하세요</span>' : '');
      overlay.onclick = function () { if (actId) { videoPlaying = true; renderVideo(); } };
      stage.appendChild(overlay);
    }

    videoGrid.innerHTML = '';
    videos.forEach(function (v, i) {
      var vId = extractYouTubeId(v.url);
      var ring = i === videoActive ? '0 0 0 2px #191c1e' : 'inset 0 0 0 1px #c6c6cd';
      var thumbBg = vId
        ? "background-image:url('https://img.youtube.com/vi/" + vId + "/mqdefault.jpg'); background-size:cover; background-position:center;"
        : 'background-image:repeating-linear-gradient(45deg,#e0e3e5 0 8px,#eceef0 8px 16px);';
      var card = document.createElement('button');
      card.type = 'button';
      card.setAttribute('aria-label', '시공 영상 ' + (i + 1) + ' 선택');
      card.style.cssText = 'position:relative; aspect-ratio:16/9; border:0; padding:0; border-radius:2px; overflow:hidden; cursor:pointer; background:#e0e3e5; ' + thumbBg + ' box-shadow:' + ring + ';';
      card.innerHTML =
        '<div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(19,27,46,0.1);">' +
        '<div style="width:30px; height:30px; border-radius:2px; background:rgba(25,28,30,0.75); display:flex; align-items:center; justify-content:center;">' +
        '<div style="width:0; height:0; border-left:10px solid #f7f9fb; border-top:6px solid transparent; border-bottom:6px solid transparent; margin-left:2px;"></div>' +
        '</div></div>';
      card.onclick = function () { videoActive = i; videoPlaying = false; renderVideo(); };
      videoGrid.appendChild(card);
    });
  }
  renderVideo();

  // ---- FAQ ----
  var faqsData = [
    { q: '지상층에도 드럼 방음이 가능한가요?', a: '가능합니다. MUTESOUND는 지상층 드럼 방음 시공이 가능한 국내 소수 업체로, 부유 구조와 이중 차음벽 설계를 통해 드럼 기준 -60dB 이상의 차음 성능을 구현합니다.' },
    { q: '공사 기간은 얼마나 걸리나요?', a: '공간 규모와 차음 등급에 따라 다르지만, 일반적인 연습실 기준 약 2~4주가 소요됩니다. 실측 후 정확한 일정을 안내해 드립니다.' },
    { q: '기존 인테리어를 살리면서 시공할 수 있나요?', a: '네. 마감재와 디자인 콘셉트를 함께 협의해 차음 성능과 인테리어를 동시에 설계합니다. 작업실의 분위기를 해치지 않습니다.' },
    { q: '견적은 어떻게 산정되나요?', a: '현장 실측을 통한 면적·구조·목표 차음 등급을 기준으로 산정합니다. 무료 상담 후 투명한 항목별 견적서를 제공합니다.' }
  ];
  var openFaq = 0;
  var faqList = document.getElementById('faqList');

  faqsData.forEach(function (f, i) {
    var item = document.createElement('div');
    item.style.cssText = 'border-bottom:1px solid #c6c6cd;';

    var header = document.createElement('button');
    header.type = 'button';
    header.setAttribute('aria-controls', 'faq-panel-' + i);
    header.style.cssText = 'width:100%; border:0; background:transparent; text-align:left; cursor:pointer; padding:24px 28px; display:flex; justify-content:space-between; align-items:center; gap:20px; transition:background 0.2s;';
    header.innerHTML =
      '<span style="font-size:17px; font-weight:600; color:#191c1e; letter-spacing:-0.01em;">' + esc(f.q) + '</span>' +
      '<span class="faq-sign" style="font-size:22px; font-weight:300; color:#45464d; line-height:1; flex-shrink:0;"></span>';

    var body = document.createElement('div');
    body.id = 'faq-panel-' + i;
    body.innerHTML = '<div style="padding:0 28px 24px; font-size:15px; line-height:1.8; color:#45464d;">' + esc(f.a) + '</div>';

    var sign = header.querySelector('.faq-sign');

    function apply() {
      var open = openFaq === i;
      header.setAttribute('aria-expanded', open ? 'true' : 'false');
      sign.textContent = open ? '-' : '+';
      body.style.cssText = 'overflow:hidden; transition:max-height 0.35s cubic-bezier(0.4,0,0.2,1),opacity 0.25s ease; max-height:' + (open ? '300px' : '0') + '; opacity:' + (open ? '1' : '0') + ';';
    }
    header.onclick = function () {
      openFaq = (openFaq === i) ? -1 : i;
      faqApplyAll();
    };
    item.appendChild(header);
    item.appendChild(body);
    faqList.appendChild(item);
    item._apply = apply;
  });
  function faqApplyAll() {
    Array.prototype.forEach.call(faqList.children, function (item) { item._apply(); });
  }
  faqApplyAll();

  // ---- CONTACT FORM ----
  // Static page, no server: submissions POST straight to Web3Forms, which
  // emails the result to the address tied to the access_key above.
  var form = document.getElementById('consultForm');
  var formCard = document.getElementById('formCard');
  var consultSubmit = document.getElementById('consultSubmit');
  var consultError = document.getElementById('consultError');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    consultError.style.display = 'none';
    consultSubmit.disabled = true;
    consultSubmit.textContent = '전송 중...';

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.success) throw new Error(data.message || 'submit failed');
        formCard.innerHTML =
          '<div style="min-height:420px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:20px;">' +
          '<div style="width:56px; height:56px; border-radius:2px; background:#191c1e; color:#f7f9fb; display:flex; align-items:center; justify-content:center;">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>' +
          '<div style="font-size:24px; font-weight:700; letter-spacing:-0.01em;">신청이 접수되었습니다</div>' +
          '<div style="font-size:15px; color:#45464d; line-height:1.7;">영업일 기준 1일 이내에<br>전문가가 직접 연락드리겠습니다.</div>' +
          '</div>';
      })
      .catch(function () {
        consultError.style.display = 'block';
        consultSubmit.disabled = false;
        consultSubmit.textContent = '무료 상담 신청하기';
      });
  });

  // ---- MOBILE NAV ----
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var navToggleIcon = document.getElementById('navToggleIcon');
  var ICON_MENU = '<line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line>';
  var ICON_CLOSE = '<line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line>';
  function setMenu(open) {
    mobileMenu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    navToggleIcon.innerHTML = open ? ICON_CLOSE : ICON_MENU;
  }
  navToggle.addEventListener('click', function () {
    setMenu(!mobileMenu.classList.contains('open'));
  });
  Array.prototype.forEach.call(mobileMenu.querySelectorAll('[data-mm]'), function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  // Close the menu if the viewport grows back to desktop.
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) setMenu(false);
  });
})();
