import { useRef } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BusinessCardFormProps {
  formData: {
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
    logoUrl: string;
  };
  onChange: (field: string, value: string) => void;
}

export function BusinessCardForm({ formData, onChange }: BusinessCardFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 고유한 파일명 생성
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (error) {
        console.error('로고 업로드 실패:', error);
        alert('로고 업로드에 실패했습니다.');
        return;
      }

      // 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        onChange('logoUrl', urlData.publicUrl);
      }
    } catch (error) {
      console.error('로고 업로드 중 오류:', error);
      alert('로고 업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800">명함 정보 입력</h2>

      <div className="space-y-4">

        {/* ── 로고 업로드 ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            로고 이미지
          </label>
          <div className="flex items-center gap-4">
            {/* 미리보기 */}
            <div
              className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="로고" className="w-full h-full object-contain" />
              ) : (
                <ImageIcon size={24} className="text-gray-400" />
              )}
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors text-left"
              >
                이미지 선택 (JPG, PNG, WEBP)
              </button>
              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={() => { onChange('logoUrl', '/logo.webp'); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                >
                  <X size={12} /> 이미지 제거
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            회사명
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="JB.E 기업지원센터"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            회사 부제목
          </label>
          <input
            type="text"
            value={formData.companySubtitle}
            onChange={(e) => onChange('companySubtitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="기업 정책자금 전문 컨설팅"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              직책
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => onChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="경영관리부 / 대리"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            전화번호
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="010-0000-0000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            주소
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="서울시 강남구"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            태그라인 / 서비스 설명
          </label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => onChange('tagline', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="무료 정책자금 가능 여부 진단"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메인 컬러
            </label>
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => onChange('primaryColor', e.target.value)}
              className="w-full h-10 rounded-md cursor-pointer"
              title="메인 컬러"
              aria-label="메인 컬러"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              보조 컬러
            </label>
            <input
              type="color"
              value={formData.secondaryColor}
              onChange={(e) => onChange('secondaryColor', e.target.value)}
              className="w-full h-10 rounded-md cursor-pointer"
              title="보조 컬러"
              aria-label="보조 컬러"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
