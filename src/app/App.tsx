import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { BusinessCardForm } from './components/BusinessCardForm';
import { BusinessCardPreview } from './components/BusinessCardPreview';
import PreviewPage from './pages/PreviewPage';

/**
 * 한국 전화번호 자동 포맷터
 * - 숫자만 추출 후 번호 체계에 맞게 하이픈 삽입
 * - 02 (서울): 2-3-4 (9자리) / 2-4-4 (10자리)
 * - 010: 3-4-4 (11자리)
 * - 011/016~019: 3-3-4 (10자리)
 * - 0XX (지역번호): 3-3-4 (10자리) / 3-4-4 (11자리)
 * - 0X0 (대표번호, 15XX): 4-4 (8자리)
 */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  const d = digits;
  const n = d.length;
  if (n === 0) return '';

  // 서울 지역번호 (02)
  if (d.startsWith('02')) {
    if (n <= 2) return d;
    if (n <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    // 9자리(02-XXX-XXXX) vs 10자리(02-XXXX-XXXX)
    if (n <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }

  // 010 (3-4-4)
  if (d.startsWith('010')) {
    if (n <= 3) return d;
    if (n <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
  }

  // 011 / 016~019 구형 휴대폰 (3-3-4)
  if (/^01[1-9]/.test(d)) {
    if (n <= 3) return d;
    if (n <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 10)}`;
  }

  // 기타 지역번호 0XX (031, 032 … 070 등)
  // 10자리: 3-3-4 / 11자리: 3-4-4
  if (d.startsWith('0')) {
    if (n <= 3) return d;
    if (n <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
    if (n <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
  }

  // 그 외 (숫자 그대로)
  return d;
}

// 기본 폼 데이터
const DEFAULT_FORM = {
  companyName: 'JB.E 기업지원센터',
  companySubtitle: '',
  name: '',
  title: '',
  phone: '',
  email: 'jb260330@naver.com',
  address: '대전 서구 둔산동 1015 6층',
  tagline: '무료 정책자금 가능 여부 진단',
  primaryColor: '#1e3a8a',
  secondaryColor: '#f59e0b',
  logoUrl: '/logo.webp',
};

function EditorPage() {
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const handleChange = (field: string, value: string) => {
    if (field === 'phone') {
      // 숫자만 추출 후 포맷팅 (삭제 시 자연스럽게 동작)
      setFormData(prev => ({ ...prev, phone: formatPhone(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  useEffect(() => {
    // 카카오톡 인앱 브라우저 감지 및 외부 브라우저 강제 이동
    const ua = navigator.userAgent;
    const isKakao = ua.indexOf('KAKAOTALK') > -1;
    if (!isKakao) return;

    if (/Android/i.test(ua)) {
      // 안드로이드: intent 스킴으로 Chrome/기본 브라우저 실행
      window.location.href = 'intent://' + window.location.href.replace(/https?:\/\//, '')
        + '#Intent;scheme=https;action=android.intent.action.VIEW;'
        + 'category=android.intent.category.BROWSABLE;end';
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      // iOS: 즉시 안내 배너 표시 (팝업 시도 없이)
      const banner = document.createElement('div');
      banner.id = 'kakao-banner';
      banner.style.cssText = [
        'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:9999',
        'background:#FEE500', 'color:#3C1E1E', 'padding:14px 16px',
        'font-family:-apple-system,sans-serif', 'font-size:14px',
        'display:flex', 'align-items:stretch', 'justify-content:space-between',
        'gap:10px', 'box-shadow:0 2px 8px rgba(0,0,0,.18)'
      ].join(';');
      banner.innerHTML =
        '<div style="flex:1">' +
          '<strong>🌐 카카오톡 앱 안에서 열림</strong><br>' +
          '정상 동작을 위해 외부 브라우저로 전환하세요.<br>' +
          '<b>우측 상단 ··· 메뉴 → 다른 브라우저로 열기</b>' +
        '</div>' +
        '<button onclick="document.getElementById(\'kakao-banner\').remove()" ' +
        'style="flex-shrink:0;background:rgba(0,0,0,.12);border:none;border-radius:50%;' +
        'width:26px;height:26px;font-size:16px;cursor:pointer;line-height:1">✕</button>';
      document.body.prepend(banner);

      // 배너가 닫히지 않도록 주기적으로 확인 (사용자가 닫으면 재표시 안 함)
      const interval = setInterval(() => {
        if (!document.getElementById('kakao-banner')) {
          document.body.prepend(banner);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">디지털 명함 생성기</h1>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <BusinessCardForm formData={formData} onChange={handleChange} />
          <div className="lg:sticky lg:top-8">
            <BusinessCardPreview formData={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EditorPage />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}