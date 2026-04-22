import { Phone, Mail, MapPin, TrendingUp, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface BusinessCardPreviewProps {
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
}

export function BusinessCardPreview({ formData }: BusinessCardPreviewProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [shadow, setShadow] = useState("0 25px 50px -12px rgba(0,0,0,0.25)");
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 입장 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateY = (mouseX / rect.width) * 22;
    const rotateX = -(mouseY / rect.height) * 22;
    const shadowX = -(mouseX / rect.width) * 35;
    const shadowY = -(mouseY / rect.height) * 35;
    const shadowBlur = 60 + Math.abs(rotateX) + Math.abs(rotateY);

    // 빛 반사 위치 계산
    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;

    setRotation({ x: rotateX, y: rotateY });
    setShadow(`${shadowX}px ${shadowY}px ${shadowBlur}px -12px rgba(0,0,0,0.35)`);
    setGlare({ x: glareX, y: glareY, opacity: 0.18 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setShadow("0 25px 50px -12px rgba(0,0,0,0.25)");
    setGlare({ x: 50, y: 50, opacity: 0 });
    setIsHovered(false);
  };

  const cardStyle: React.CSSProperties = {
    aspectRatio: "85.6 / 54",
    transform: mounted
      ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.04 : 1})`
      : "perspective(1000px) rotateX(8deg) rotateY(-8deg) scale(0.9)",
    transformStyle: "preserve-3d",
    boxShadow: shadow,
    opacity: mounted ? 1 : 0,
    transition: isHovered
      ? "transform 0.1s ease-out, box-shadow 0.1s ease-out, opacity 0.6s ease"
      : "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s ease, opacity 0.6s ease",
  };

  const glareStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity * 2}) 0%, rgba(255,255,255,${glare.opacity}) 30%, transparent 70%)`,
    pointerEvents: "none",
    borderRadius: "inherit",
    transition: isHovered ? "none" : "opacity 0.5s ease",
    zIndex: 10,
  };

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">명함 미리보기</h2>

      {/* 카드 래퍼 */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative bg-white rounded-lg overflow-hidden cursor-pointer"
        style={cardStyle}
      >
        {/* 빛 반사 레이어 */}
        <div style={glareStyle} />

        {/* 명함 내용 */}
        <div className="absolute inset-0 p-8 flex flex-col">
          {/* 상단 */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <h1
                className="text-4xl font-bold mb-2 transition-all duration-300"
                style={{ color: formData.primaryColor }}
              >
                {formData.companyName || "회사명"}
              </h1>
              <p
                className="text-lg transition-all duration-300"
                style={{ color: formData.primaryColor }}
              >
                {formData.companySubtitle || "회사 설명"}
              </p>
            </div>

            {/* 로고 */}
            <div
              className="ml-4 flex flex-col items-center transition-transform duration-300"
              style={{ transform: isHovered ? "translateZ(20px) scale(1.1)" : "translateZ(0)" }}
            >
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: formData.primaryColor + "20" }}
              >
                <TrendingUp size={32} style={{ color: formData.secondaryColor }} />
              </div>
            </div>
          </div>

          {/* 연락처 */}
          <div className="flex-1 flex flex-col justify-center space-y-3">
            <div className="text-right mb-4">
              <p className="text-gray-600 text-sm mb-1">{formData.title || "직책"}</p>
              <p
                className="text-3xl font-bold transition-all duration-300"
                style={{ color: formData.primaryColor }}
              >
                {formData.name || "이름"}
              </p>
            </div>

            {[
              { Icon: Phone, value: formData.phone || "010-0000-0000" },
              { Icon: Mail, value: formData.email || "email@example.com" },
              { Icon: MapPin, value: formData.address || "주소" },
            ].map(({ Icon, value }, i) => (
              <div key={i}>
                <div className="flex items-center justify-end space-x-3">
                  <Icon size={20} style={{ color: formData.primaryColor }} />
                  <span className="text-lg" style={{ color: formData.primaryColor }}>
                    {value}
                  </span>
                </div>
                {i < 2 && <div className="h-px bg-gray-300 my-2" />}
              </div>
            ))}
          </div>

          {/* 하단 태그라인 */}
          <div
            className="absolute bottom-0 left-0 right-0 p-6 text-white transition-all duration-300"
            style={{ backgroundColor: formData.primaryColor }}
          >
            <div className="flex items-center space-x-3">
              <span
                className="text-3xl transition-transform duration-300"
                style={{ transform: isHovered ? "translateX(6px)" : "translateX(0)" }}
              >
                ��
              </span>
              <span
                className="text-xl font-semibold transition-all duration-300"
                style={{ color: formData.secondaryColor }}
              >
                {formData.tagline || "서비스 설명을 입력하세요"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 다운로드 버튼 */}
      <div className="mt-6 flex justify-center">
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: formData.primaryColor }}
          onClick={() => alert("명함 다운로드 기능은 추후 구현 예정입니다.")}
        >
          <Download size={18} />
          명함 다운로드
        </button>
      </div>

      {/* 조작 힌트 */}
      <p className="text-center text-sm text-gray-400 mt-3 animate-pulse">
        ✦ 명함 위에 마우스를 올려보세요
      </p>
    </div>
  );
}
