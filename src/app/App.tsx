import { useState } from 'react';
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
  secondaryColor: '#f59e0b'
};

function EditorPage() {
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">디지털 명함 생성기</h1>
          <p className="text-xl text-gray-600">정보를 입력하고 실시간으로 명함을 확인하세요</p>
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