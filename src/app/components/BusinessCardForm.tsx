import { Phone, Mail, MapPin } from 'lucide-react';

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
  };
  onChange: (field: string, value: string) => void;
}

export function BusinessCardForm({ formData, onChange }: BusinessCardFormProps) {
  return (
    <div className="w-full max-w-md space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800">명함 정보 입력</h2>

      <div className="space-y-4">
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
