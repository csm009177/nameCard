import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { BusinessCardForm } from './components/BusinessCardForm';
import { BusinessCardPreview } from './components/BusinessCardPreview';
import PreviewPage from './pages/PreviewPage';

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
    setFormData(prev => ({ ...prev, [field]: value }));
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