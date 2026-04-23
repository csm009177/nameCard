export interface CardData {
  companyName: string;
  companySubtitle: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  address: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

export function exportToHtml(data: CardData): void {
  // 로고를 Base64로 변환 후 HTML 생성
  _fetchLogoBase64(data.logoUrl).then((logoBase64) => {
    _buildAndDownload(data, logoBase64);
  });
}

/** URL → Base64 변환 (실패 시 null 반환) */
async function _fetchLogoBase64(logoUrl?: string): Promise<string | null> {
  if (!logoUrl) return null;
  // 이미 Base64인 경우
  if (logoUrl.startsWith('data:')) return logoUrl;
  try {
    // 상대 경로면 절대 경로로 변환
    const absoluteUrl = logoUrl.startsWith('http')
      ? logoUrl
      : `${window.location.origin}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
    const res = await fetch(absoluteUrl);
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function _buildAndDownload(data: CardData, resolvedLogoUrl: string | null): void {
  const {
    companyName,
    companySubtitle,
    name,
    title,
    phone,
    email,
    address,
    tagline,
    primaryColor,
    secondaryColor,
  } = data;

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(name || "명함")} - ${esc(companyName || "디지털 명함")}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-height: 100dvh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #e8edf5 0%, #d0daea 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: clamp(16px, 5vw, 48px) clamp(12px, 4vw, 32px);
    gap: clamp(16px, 3vw, 28px);
  }
  /* ── 카드 씬 ── */
  .scene { perspective: 1200px; width: min(540px, 100%); }
  .card {
    position: relative; width: 100%; aspect-ratio: 85.6 / 54;
    background: #fff; border-radius: clamp(8px, 2vw, 14px); overflow: hidden;
    box-shadow: 0 20px 60px -15px rgba(0,0,0,0.22);
    transition: transform 0.12s ease-out, box-shadow 0.12s ease-out;
    cursor: default; -webkit-tap-highlight-color: transparent;
  }
  /* 데스크탑(마우스)만 3D 틸트 */
  @media (hover: hover) and (pointer: fine) {
    .card:hover { transform: perspective(1200px) scale(1.03); }
    .card:hover .glare { opacity: 1; }
    .card:hover .tagline-emoji { transform: translateX(6px); }
  }
  .glare {
    position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
    z-index: 10; opacity: 0; transition: opacity 0.3s;
    background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 40%, transparent 70%);
  }
  .card-inner {
    position: absolute; inset: 0; padding: clamp(12px, 4%, 28px);
    display: flex; flex-direction: column;
  }
  /* ── 상단 헤더 ── */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: clamp(8px, 3%, 20px); }
  .company-name { font-size: clamp(14px, 3.5vw, 26px); font-weight: 800; color: ${esc(primaryColor)}; line-height: 1.2; }
  .company-sub  { font-size: clamp(9px, 1.6vw, 13px); color: ${esc(primaryColor)}; margin-top: 3px; opacity: 0.75; }
  .logo-box {
    width: clamp(32px, 7%, 48px); height: clamp(32px, 7%, 48px);
    border-radius: 8px; background: ${esc(primaryColor)}22;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-left: 10px; overflow: hidden;
  }
  .logo-box img { width: 100%; height: 100%; object-fit: contain; }
  /* ── 중단 ── */
  .body { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: clamp(4px, 1%, 8px); }
  .person { text-align: right; margin-bottom: clamp(4px, 1.5%, 10px); }
  .person-title { font-size: clamp(9px, 1.5vw, 11px); color: #666; }
  .person-name  { font-size: clamp(16px, 3vw, 22px); font-weight: 800; color: ${esc(primaryColor)}; }
  .divider { height: 1px; background: #e2e8f0; }
  .row {
    display: flex; align-items: center; justify-content: flex-end;
    gap: clamp(4px, 1.5vw, 10px); font-size: clamp(10px, 1.6vw, 13px); color: ${esc(primaryColor)};
  }
  .row a { color: inherit; text-decoration: none; }
  @media (hover: hover) { .row a:hover { text-decoration: underline; } }
  .copy-btn {
    background: none; border: none; cursor: pointer; color: ${esc(primaryColor)};
    opacity: 0.5; padding: 2px; transition: opacity 0.2s; line-height: 1;
    min-width: 28px; min-height: 28px; display: flex; align-items: center; justify-content: center;
  }
  @media (hover: hover) { .copy-btn:hover { opacity: 1; } }
  /* ── 태그라인 ── */
  .tagline-bar {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: clamp(6px, 2%, 14px) clamp(10px, 3%, 22px);
    background: ${esc(primaryColor)}; display: flex; align-items: center; gap: 8px;
  }
  .tagline-emoji { font-size: clamp(12px, 2.5vw, 20px); display: inline-block; transition: transform 0.3s; }
  .tagline-text { font-size: clamp(10px, 1.8vw, 13px); font-weight: 600; color: ${esc(secondaryColor)}; }
  /* ── 액션 버튼 ── */
  .actions { display: flex; flex-direction: row; gap: 10px; width: min(540px, 100%); }
  .btn {
    flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 13px 8px; border-radius: 10px; border: none; cursor: pointer;
    font-size: clamp(12px, 2.5vw, 14px); font-weight: 600; text-decoration: none;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    min-height: 48px; -webkit-tap-highlight-color: transparent; white-space: nowrap;
  }
  @media (hover: hover) and (pointer: fine) {
    .btn:hover { transform: scale(1.04); box-shadow: 0 8px 24px rgba(0,0,0,0.18); }
  }
  .btn:active { opacity: 0.82; transform: scale(0.97); }
  .btn-primary   { background: ${esc(primaryColor)}; color: #fff; }
  .btn-secondary { background: #fff; color: ${esc(primaryColor)}; border: 1.5px solid ${esc(primaryColor)}30; }
  /* 매우 좁은 화면: 텍스트 숨김, 아이콘 원형 버튼 */
  @media (max-width: 360px) {
    .btn-label { display: none; }
    .btn { padding: 0; flex: 0 0 48px; border-radius: 50%; }
  }
  /* ── 토스트 ── */
  .toast {
    position: fixed; bottom: clamp(16px, 5vw, 28px); left: 50%;
    transform: translateX(-50%) translateY(16px);
    background: rgba(30,41,59,0.93); color: #fff;
    padding: 10px 20px; border-radius: 30px;
    font-size: 13px; font-weight: 500; white-space: nowrap;
    opacity: 0; pointer-events: none; transition: opacity 0.25s, transform 0.25s;
    z-index: 999; backdrop-filter: blur(8px);
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  /* ── 힌트 ── */
  .hint { font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.6; }
  @media (max-width: 480px) { .hint-desktop { display: none; } }
  /* ── 애니메이션 ── */
  @keyframes float-in {
    from { opacity: 0; transform: translateY(14px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .scene   { animation: float-in 0.5s cubic-bezier(0.23,1,0.32,1) both; }
  .actions { animation: float-in 0.5s cubic-bezier(0.23,1,0.32,1) 0.08s both; }
  .hint    { animation: float-in 0.5s cubic-bezier(0.23,1,0.32,1) 0.14s both; }
</style>
</head>
<body>

<div class="scene">
  <div class="card" id="card">
    <div class="glare" id="glare"></div>
    <div class="card-inner">
      <!-- 상단 -->
      <div class="header">
        <div>
          <div class="company-name">${esc(companyName || "회사명")}</div>
          <div class="company-sub">${esc(companySubtitle || "")}</div>
        </div>
        <div class="logo-box">
          ${resolvedLogoUrl
            ? `<img src="${resolvedLogoUrl}" alt="로고" onerror="this.parentElement.innerHTML=''" />`
            : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${esc(secondaryColor)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`
          }
        </div>
      </div>
      <!-- 중단 -->
      <div class="body">
        <div class="person">
          <div class="person-title">${esc(title || "")}</div>
          <div class="person-name">${esc(name || "이름")}</div>
        </div>
        <div class="row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${esc(primaryColor)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 5.61 5.61l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <a href="tel:${esc(phone || "")}">${esc(phone || "")}</a>
          <button class="copy-btn" title="번호 복사" onclick="copyText('${esc(phone || "")}', '전화번호 복사됨!')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <div class="divider"></div>
        <div class="row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${esc(primaryColor)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <a href="mailto:${esc(email || "")}">${esc(email || "")}</a>
          <button class="copy-btn" title="이메일 복사" onclick="copyText('${esc(email || "")}', '이메일 복사됨!')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <div class="divider"></div>
        <div class="row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${esc(primaryColor)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>${esc(address || "")}</span>
        </div>
      </div>
      <!-- 태그라인 -->
      <div class="tagline-bar">
        <span class="tagline-emoji">👉</span>
        <span class="tagline-text">${esc(tagline || "")}</span>
      </div>
    </div>
  </div>
</div>

<!-- 액션 버튼 -->
<div class="actions">
  <a class="btn btn-primary" href="tel:${esc(phone || "")}">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 5.61 5.61l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    <span class="btn-label">전화하기</span>
  </a>
  <a class="btn btn-secondary" href="mailto:${esc(email || "")}">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${esc(primaryColor)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
    <span class="btn-label">메일 보내기</span>
  </a>
  <button class="btn btn-secondary" onclick="copyText('${esc(phone || "")}', '전화번호가 복사되었습니다!')">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${esc(primaryColor)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
    <span class="btn-label">번호 복사</span>
  </button>
</div>

<p class="hint">
  <span class="hint-desktop">✦ 명함 위에 마우스를 올려보세요 &nbsp;|&nbsp; </span>오프라인에서도 동작합니다
</p>

<div class="toast" id="toast"></div>

<script>
(function () {
  var card = document.getElementById('card');
  var glare = document.getElementById('glare');
  var isMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── 카카오톡 인앱 브라우저 → 외부 브라우저 강제 이동 ── */
  (function () {
    var ua = navigator.userAgent;
    var isKakao = ua.indexOf('KAKAOTALK') > -1;
    if (!isKakao) return;
    var url = encodeURIComponent(window.location.href);
    if (/Android/i.test(ua)) {
      // 안드로이드: intent 스킴으로 Chrome/기본 브라우저 실행
      window.location.href = 'intent://' + window.location.href.replace(/https?:\/\//, '')
        + '#Intent;scheme=https;action=android.intent.action.VIEW;'
        + 'category=android.intent.category.BROWSABLE;end';
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      // iOS: window.open 먼저 시도, 차단될 경우 안내 배너 표시
      var opened = window.open(window.location.href, '_blank');
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        // 팝업 차단된 경우 안내 배너 삽입
        var banner = document.createElement('div');
        banner.id = 'kakao-banner';
        banner.style.cssText = [
          'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:9999',
          'background:#FEE500', 'color:#3C1E1E', 'padding:14px 16px',
          'font-family:-apple-system,sans-serif', 'font-size:14px',
          'display:flex', 'align-items:center', 'justify-content:space-between',
          'gap:10px', 'box-shadow:0 2px 8px rgba(0,0,0,.18)'
        ].join(';');
        banner.innerHTML =
          '<span>🌐 카카오톡에서는 일부 기능이 제한됩니다.<br>' +
          '<b>우측 상단 ···</b> 메뉴 → <b>다른 브라우저로 열기</b>를 눌러 주세요.</span>' +
          '<button onclick="document.getElementById(\'kakao-banner\').remove()" ' +
          'style="flex-shrink:0;background:rgba(0,0,0,.12);border:none;border-radius:50%;' +
          'width:26px;height:26px;font-size:16px;cursor:pointer;line-height:1">✕</button>';
        document.body.prepend(banner);
      }
    }
  })();

  /* ── 3D 틸트 (마우스 기기만) ── */
  if (isMouse) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var mx = e.clientX - (r.left + r.width / 2);
      var my = e.clientY - (r.top + r.height / 2);
      var rotY =  (mx / r.width)  * 20;
      var rotX = -(my / r.height) * 20;
      var sx = -(mx / r.width)  * 28;
      var sy = -(my / r.height) * 28;
      var gx = ((e.clientX - r.left) / r.width)  * 100;
      var gy = ((e.clientY - r.top)  / r.height) * 100;
      card.style.transform = 'perspective(1200px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.03)';
      card.style.boxShadow = sx + 'px ' + sy + 'px ' + (50 + Math.abs(rotX) + Math.abs(rotY)) + 'px -12px rgba(0,0,0,0.26)';
      glare.style.background = 'radial-gradient(circle at ' + gx + '% ' + gy + '%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.08) 50%, transparent 75%)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
      card.style.boxShadow = '';
      glare.style.background = '';
    });
  }

  /* ── 클립보드 복사 ── */
  window.copyText = function (text, msg) {
    if (!text) return;
    var done = function () { showToast(msg); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else { fallbackCopy(text, done); }
  };
  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand('copy'); cb(); } catch(e) {}
    document.body.removeChild(ta);
  }

  /* ── 토스트 ── */
  function showToast(msg) {
    var t = document.getElementById('toast');
    t.textContent = '✓ ' + msg;
    t.classList.add('show');
    clearTimeout(window._tt);
    window._tt = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
})();
</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.name || "명함"}_디지털명함.html`;
  a.click();
  URL.revokeObjectURL(url);
}

