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
}

export function exportToHtml(data: CardData): void {
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
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #e8edf5 0%, #d0daea 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    padding: 32px 16px;
    gap: 24px;
  }
  .scene {
    perspective: 1000px;
    width: min(540px, 100%);
  }
  .card {
    position: relative;
    width: 100%;
    aspect-ratio: 85.6 / 54;
    background: #fff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.22);
    transform: perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1);
    transition: transform 0.12s ease-out, box-shadow 0.12s ease-out;
    cursor: default;
  }
  .card:hover { transform: perspective(1000px) scale(1.03); }
  .glare {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s;
    background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 40%, transparent 70%);
  }
  .card:hover .glare { opacity: 1; }
  .card-inner {
    position: absolute;
    inset: 0;
    padding: clamp(16px, 4%, 32px);
    display: flex;
    flex-direction: column;
  }
  /* ── 상단 헤더 ── */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: clamp(12px,3%,24px); }
  .company-name { font-size: clamp(18px, 4vw, 28px); font-weight: 800; color: ${esc(primaryColor)}; line-height: 1.2; }
  .company-sub  { font-size: clamp(10px, 2vw, 14px); color: ${esc(primaryColor)}; margin-top: 4px; opacity: 0.8; }
  .logo-box {
    width: clamp(36px,8%,52px); height: clamp(36px,8%,52px);
    border-radius: 10px;
    background: ${esc(primaryColor)}22;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-left: 12px;
  }
  /* ── 중단 ── */
  .body { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 6px; }
  .person { text-align: right; margin-bottom: 8px; }
  .person-title { font-size: clamp(9px, 1.8vw, 12px); color: #666; }
  .person-name  { font-size: clamp(16px, 3.5vw, 24px); font-weight: 800; color: ${esc(primaryColor)}; }
  .divider { height: 1px; background: #e2e8f0; }
  .row {
    display: flex; align-items: center; justify-content: flex-end; gap: 8px;
    font-size: clamp(9px, 1.8vw, 14px); color: ${esc(primaryColor)};
  }
  .row a { color: inherit; text-decoration: none; }
  .row a:hover { text-decoration: underline; }
  .copy-btn {
    background: none; border: none; cursor: pointer;
    color: ${esc(primaryColor)}; opacity: 0.55; padding: 2px;
    font-size: 11px; transition: opacity 0.2s;
  }
  .copy-btn:hover { opacity: 1; }
  /* ── 하단 태그라인 ── */
  .tagline-bar {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: clamp(8px,2%,16px) clamp(12px,3%,24px);
    background: ${esc(primaryColor)};
    display: flex; align-items: center; gap: 10px;
  }
  .tagline-emoji { font-size: clamp(14px, 3vw, 22px); display: inline-block; transition: transform 0.3s; }
  .card:hover .tagline-emoji { transform: translateX(6px); }
  .tagline-text { font-size: clamp(9px, 2vw, 14px); font-weight: 600; color: ${esc(secondaryColor)}; }
  /* ── 액션 버튼 ── */
  .actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 22px; border-radius: 10px; border: none; cursor: pointer;
    font-size: 14px; font-weight: 600; text-decoration: none;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .btn:hover { transform: scale(1.05); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
  .btn:active { transform: scale(0.97); }
  .btn-primary { background: ${esc(primaryColor)}; color: #fff; }
  .btn-secondary { background: #fff; color: ${esc(primaryColor)}; border: 2px solid ${esc(primaryColor)}22; }
  /* ── 알림 토스트 ── */
  .toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px);
    background: #1e293b; color: #fff; padding: 10px 20px; border-radius: 30px;
    font-size: 13px; font-weight: 500; white-space: nowrap;
    opacity: 0; pointer-events: none; transition: opacity 0.25s, transform 0.25s;
    z-index: 999;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  /* ── 힌트 ── */
  .hint { font-size: 11px; color: #94a3b8; text-align: center; }
  @keyframes float-in {
    from { opacity:0; transform: perspective(1000px) rotateX(8deg) rotateY(-8deg) scale(0.92); }
    to   { opacity:1; transform: perspective(1000px) rotateX(0) rotateY(0) scale(1); }
  }
  .card { animation: float-in 0.6s cubic-bezier(0.23,1,0.32,1) both; }
</style>
</head>
<body>

<div class="scene">
  <div class="card" id="card">
    <div class="glare"></div>
    <div class="card-inner">
      <!-- 상단 -->
      <div class="header">
        <div>
          <div class="company-name">${esc(companyName || "회사명")}</div>
          <div class="company-sub">${esc(companySubtitle || "")}</div>
        </div>
        <div class="logo-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${esc(secondaryColor)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
          </svg>
        </div>
      </div>
      <!-- 중단 -->
      <div class="body">
        <div class="person">
          <div class="person-title">${esc(title || "")}</div>
          <div class="person-name">${esc(name || "이름")}</div>
        </div>
        <div class="row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${esc(primaryColor)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 5.61 5.61l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <a href="tel:${esc(phone || "")}">${esc(phone || "")}</a>
          <button class="copy-btn" title="번호 복사" onclick="copyText('${esc(phone || "")}', '전화번호 복사됨!')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <div class="divider"></div>
        <div class="row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${esc(primaryColor)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <a href="mailto:${esc(email || "")}">${esc(email || "")}</a>
          <button class="copy-btn" title="이메일 복사" onclick="copyText('${esc(email || "")}', '이메일 복사됨!')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <div class="divider"></div>
        <div class="row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${esc(primaryColor)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>${esc(address || "")}</span>
        </div>
      </div>
      <!-- 하단 태그라인 -->
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
    전화하기
  </a>
  <a class="btn btn-secondary" href="mailto:${esc(email || "")}">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${esc(primaryColor)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
    메일 보내기
  </a>
  <button class="btn btn-secondary" onclick="copyText('${esc(phone || "")}', '전화번호가 복사되었습니다!')">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${esc(primaryColor)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
    번호 복사
  </button>
</div>

<p class="hint">✦ 명함 위에 마우스를 올려보세요 &nbsp;|&nbsp; 오프라인에서도 동작합니다</p>

<!-- 토스트 알림 -->
<div class="toast" id="toast"></div>

<script>
(function () {
  /* ── 3D 마우스 틸트 ── */
  var card = document.getElementById('card');
  card.addEventListener('mousemove', function (e) {
    var r = card.getBoundingClientRect();
    var mx = e.clientX - (r.left + r.width / 2);
    var my = e.clientY - (r.top + r.height / 2);
    var rotY = (mx / r.width) * 22;
    var rotX = -(my / r.height) * 22;
    var sx = -(mx / r.width) * 30;
    var sy = -(my / r.height) * 30;
    card.style.transform = 'perspective(1000px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.03)';
    card.style.boxShadow = sx + 'px ' + sy + 'px ' + (50 + Math.abs(rotX) + Math.abs(rotY)) + 'px -12px rgba(0,0,0,0.28)';
  });
  card.addEventListener('mouseleave', function () {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    card.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.22)';
  });

  /* ── 클립보드 복사 ── */
  window.copyText = function (text, msg) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showToast(msg); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(msg);
    }
  };

  /* ── 토스트 ── */
  function showToast(msg) {
    var t = document.getElementById('toast');
    t.textContent = '✓ ' + msg;
    t.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
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
