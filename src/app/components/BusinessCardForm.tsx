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

    // 파일을 Base64로 변환 (로컬 폴백용)
    const toBase64 = (f: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });

    try {
      // Supabase Storage 업로드 시도
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (!error) {
        // 업로드 성공 → 공개 URL 사용
        const { data: urlData } = supabase.storage
          .from('logos')
          .getPublicUrl(filePath);
        if (urlData?.publicUrl) {
          onChange('logoUrl', urlData.publicUrl);
          return;
        }
      }

      // Supabase 실패 시 → Base64로 로컬 저장 (오프라인/정책 문제 대응)
      console.warn('[Logo] Supabase 업로드 실패, Base64 폴백 사용:', error?.message);
      const base64 = await toBase64(file);
      onChange('logoUrl', base64);
    } catch (err) {
      // 완전 실패 시에도 Base64 폴백
      console.error('[Logo] 업로드 오류, Base64 폴백:', err);
      try {
        const base64 = await toBase64(file);
        onChange('logoUrl', base64);
      } catch {
        alert('로고 이미지를 불러올 수 없습니다.');
      }
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
            title="로고 이미지 선택"
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
