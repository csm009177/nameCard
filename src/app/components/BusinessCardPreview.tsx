import { Phone, Mail, MapPin, TrendingUp, Download, ImageIcon, FileText, ChevronDown, Video, Share2, Check, Code2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toPng, toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import { exportToHtml } from "../utils/exportToHtml";

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
  isPreviewMode?: boolean;
}

const CARD_W_MM = 85.6;
const CARD_H_MM = 54;
const CARD_W_PX = Math.round((CARD_W_MM / 25.4) * 300);
const CARD_H_PX = Math.round((CARD_H_MM / 25.4) * 300);

export function BusinessCardPreview({ formData, isPreviewMode = false }: BusinessCardPreviewProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [shadow, setShadow] = useState("0 25px 50px -12px rgba(0,0,0,0.25)");
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');
  const [savedId, setSavedId] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 입장 애니메이션
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // 드롭다운 외부 클릭 닫기
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mx = e.clientX - (rect.left + rect.width / 2);
    const my = e.clientY - (rect.top + rect.height / 2);
    const rotY = (mx / rect.width) * 20;
    const rotX = -(my / rect.height) * 20;
    const sx = -(mx / rect.width) * 30;
    const sy = -(my / rect.height) * 30;
    const blur = 50 + Math.abs(rotX) + Math.abs(rotY);
    setRotation({ x: rotX, y: rotY });
    setShadow(`${sx}px ${sy}px ${blur}px -12px rgba(0,0,0,0.3)`);
    setGlare({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100, opacity: 0.16 });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setShadow("0 25px 50px -12px rgba(0,0,0,0.25)");
    setGlare({ x: 50, y: 50, opacity: 0 });
    setIsHovered(false);
  };

  // ─── WebM 녹화 ────────────────────────────────────────────────────────────
  // 총 4초, 25fps = 100프레임
  // 구간: [0~20] 입장, [20~50] 좌우 틸트, [50~75] 빛 반사 스윕, [75~100] 복귀
  const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const getFrameState = (f: number, total: number) => {
    const t = f / total;
    if (t < 0.2) {
      // 입장: 기울어진 상태에서 평평하게
      const p = ease(t / 0.2);
      return { rotX: 8 * (1 - p), rotY: -8 * (1 - p), glareX: 50, glareY: 50, glareOp: 0, scale: 0.92 + 0.08 * p };
    } else if (t < 0.5) {
      // 좌우 틸트 (0→+20→-20→0)
      const p = (t - 0.2) / 0.3;
      const rotY = p < 0.5 ? ease(p * 2) * 20 : (1 - ease((p - 0.5) * 2)) * 20 - (ease((p - 0.5) * 2)) * 20;
      return { rotX: -rotY * 0.3, rotY, glareX: 50 + rotY * 1.5, glareY: 50, glareOp: Math.abs(rotY) / 20 * 0.1, scale: 1 };
    } else if (t < 0.8) {
      // 빛 반사 스윕 (왼쪽→오른쪽)
      const p = ease((t - 0.5) / 0.3);
      return { rotX: -3 + 6 * p, rotY: -5 + 10 * p, glareX: 5 + p * 90, glareY: 20 + p * 60, glareOp: 0.18, scale: 1 };
    } else {
      // 복귀
      const p = ease((t - 0.8) / 0.2);
      return { rotX: 3 - 3 * p, rotY: 5 - 5 * p, glareX: 95 - 45 * p, glareY: 80 - 30 * p, glareOp: 0.18 * (1 - p), scale: 1 };
    }
  };

  const doRecord = async () => {
    if (!cardRef.current || isRecording) return;
    setShowDropdown(false);
    setIsRecording(true);
    setRecordProgress(0);

    const FPS = 25;
    const DURATION_S = 4;
    const TOTAL = FPS * DURATION_S;
    const el = cardRef.current;
    const rect = el.getBoundingClientRect();

    // 캔버스 + MediaRecorder 준비
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(rect.width);
    canvas.height = Math.round(rect.height);
    const ctx = canvas.getContext("2d")!;
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const stream = canvas.captureStream(FPS);
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    recorder.start(100);

    try {
      for (let f = 0; f < TOTAL; f++) {
        const { rotX, rotY, glareX, glareY, glareOp, scale } = getFrameState(f, TOTAL);

        // React 상태 업데이트 (CSS transform 반영)
        setRotation({ x: rotX, y: rotY });
        setGlare({ x: glareX, y: glareY, opacity: glareOp });
        setShadow(`${-rotY * 1.5}px ${-rotX * 1.5}px ${60 + Math.abs(rotY)}px -12px rgba(0,0,0,0.28)`);

        // React 렌더 + CSS 반영 대기 (2 rAF)
        await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

        // html-to-image로 현재 카드 스냅샷
        const dataUrl = await toPng(el, { pixelRatio: 1, skipFonts: false, style: { transition: "none" } });
        const img = await new Promise<HTMLImageElement>((res, rej) => {
          const i = new Image();
          i.onload = () => res(i);
          i.onerror = rej;
          i.src = dataUrl;
        });

        // 배경 + 카드 이미지 합성
        ctx.fillStyle = "#e0e7f3";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 그림자 (간략화)
        ctx.shadowColor = `rgba(0,0,0,${0.15 + glareOp})`;
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = -rotY * 0.5;
        ctx.shadowOffsetY = Math.abs(rotY) * 0.3;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale ?? 1, scale ?? 1);
        ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        ctx.restore();
        ctx.shadowColor = "transparent";

        setRecordProgress(Math.round(((f + 1) / TOTAL) * 100));
      }
    } catch (err) {
      console.error("WebM 녹화 실패:", err);
      alert("WebM 녹화에 실패했습니다.");
    }

    recorder.stop();
    await new Promise<void>(r => { recorder.onstop = () => r(); });

    // 상태 복원
    handleMouseLeave();
    setIsRecording(false);
    setRecordProgress(0);

    if (chunks.length) {
      const blob = new Blob(chunks, { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formData.name || "명함"}_namecard.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  // ─── 로컬 스토리지 저장 & 공유 URL 복사 ──────────────────────────────────
  const doShare = async () => {
    const id = Date.now().toString();
    localStorage.setItem(`namecard_${id}`, JSON.stringify(formData));
    setSavedId(id);
    const url = `${window.location.origin}/preview/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard API 실패 시 수동 복사 안내
      prompt("아래 URL을 복사하세요:", url);
      return;
    }
    setShareState('copied');
    setTimeout(() => setShareState('idle'), 3000);
  };
  // ─────────────────────────────────────────────────────────────────────────

  const doCapture = async (format: "png" | "jpeg" | "pdf") => {
    if (!captureRef.current) return;
    setIsDownloading(true);
    setShowDropdown(false);
    const name = formData.name || "명함";
    try {
      const dataUrl = format === "jpeg"
        ? await toJpeg(captureRef.current, { pixelRatio: CARD_W_PX / captureRef.current.offsetWidth, quality: 0.95 })
        : await toPng(captureRef.current, { pixelRatio: CARD_W_PX / captureRef.current.offsetWidth });
      if (format === "pdf") {
        const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [CARD_W_MM, CARD_H_MM] });
        pdf.addImage(dataUrl, "PNG", 0, 0, CARD_W_MM, CARD_H_MM);
        pdf.save(`${name}_namecard.pdf`);
      } else {
        const a = document.createElement("a");
        a.download = `${name}_namecard.${format === "jpeg" ? "jpg" : "png"}`;
        a.href = dataUrl;
        a.click();
      }
    } catch {
      alert("다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ─── 명함 내용 (Tailwind 클래스 사용 - 두 카드 공용) ───────────────────
  const CardBody = () => (
    <>
      {/* 상단 */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2" style={{ color: formData.primaryColor }}>
            {formData.companyName || "회사명"}
          </h1>
          <p className="text-lg" style={{ color: formData.primaryColor }}>
            {formData.companySubtitle || "회사 설명"}
          </p>
        </div>
        <div className="ml-4">
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
          <p className="text-3xl font-bold" style={{ color: formData.primaryColor }}>
            {formData.name || "이름"}
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <Phone size={20} style={{ color: formData.primaryColor }} />
          <span className="text-lg" style={{ color: formData.primaryColor }}>
            {formData.phone || "010-0000-0000"}
          </span>
        </div>
        <div className="h-px bg-gray-300" />
        <div className="flex items-center justify-end space-x-3">
          <Mail size={20} style={{ color: formData.primaryColor }} />
          <span className="text-lg" style={{ color: formData.primaryColor }}>
            {formData.email || "email@example.com"}
          </span>
        </div>
        <div className="h-px bg-gray-300" />
        <div className="flex items-center justify-end space-x-3">
          <MapPin size={20} style={{ color: formData.primaryColor }} />
          <span className="text-lg" style={{ color: formData.primaryColor }}>
            {formData.address || "주소"}
          </span>
        </div>
      </div>

      {/* 하단 태그라인 */}
      <div
        className="absolute bottom-0 left-0 right-0 p-6"
        style={{ backgroundColor: formData.primaryColor }}
      >
        <div className="flex items-center space-x-3">
          <span className="text-3xl" style={{ display: "inline-block", transform: isHovered ? "translateX(6px)" : "translateX(0)", transition: "transform 0.3s" }}>👉</span>
          <span className="text-xl font-semibold" style={{ color: formData.secondaryColor }}>
            {formData.tagline || "서비스 설명을 입력하세요"}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">명함 미리보기</h2>

      {/* ── 3D 애니메이션 미리보기 카드 ── */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative bg-white rounded-lg overflow-hidden cursor-pointer"
        style={{
          aspectRatio: "85.6 / 54",
          transform: mounted
            ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.03 : 1})`
            : "perspective(1000px) rotateX(8deg) rotateY(-8deg) scale(0.92)",
          transformStyle: "preserve-3d",
          boxShadow: shadow,
          opacity: mounted ? 1 : 0,
          transition: isHovered
            ? "transform 0.1s ease-out, box-shadow 0.1s ease-out, opacity 0.5s"
            : "transform 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.55s ease, opacity 0.5s",
        }}
      >
        {/* 빛 반사 레이어 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity * 2.2}) 0%, rgba(255,255,255,${glare.opacity}) 35%, transparent 70%)`,
            zIndex: 10,
            transition: isHovered ? "none" : "opacity 0.4s ease",
            borderRadius: "inherit",
          }}
        />
        {/* 카드 본문 */}
        <div className="absolute inset-0 p-8 flex flex-col">
          <CardBody />
        </div>
      </div>

      {/* ── 캡처용 hidden 카드 (화면 밖, Tailwind 동일 구조) ── */}
      <div
        className="fixed overflow-hidden"
        style={{ left: "-9999px", top: 0, width: "672px", height: "424px" }}
      >
        <div
          ref={captureRef}
          className="relative bg-white overflow-hidden"
          style={{ width: "672px", height: "424px" }}
        >
          <div className="absolute inset-0 p-8 flex flex-col">
            <CardBody />
          </div>
        </div>
      </div>

      {/* ── 녹화 진행 바 ── */}
      {isRecording && (
        <div className="mt-4 px-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-purple-600 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" style={{ animation: "card-spin 1s linear infinite" }} />
              WebM 녹화 중... {recordProgress}%
            </span>
            <span className="text-xs text-gray-400">4초 애니메이션 캡처</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-100"
              style={{ width: `${recordProgress}%`, backgroundColor: "#7c3aed" }}
            />
          </div>
        </div>
      )}

      {/* ── 다운로드 버튼 ── */}
      <div className="mt-6 flex justify-center">
        <div ref={dropdownRef} className="relative inline-flex">
          {/* 메인 버튼 */}
          <button
            onClick={() => doCapture("png")}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60"
            style={{ backgroundColor: formData.primaryColor, borderRadius: "8px 0 0 8px", border: "none", cursor: isDownloading ? "not-allowed" : "pointer" }}
          >
            {isDownloading ? (
              <>
                <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white" style={{ animation: "card-spin 0.7s linear infinite" }} />
                처리 중...
              </>
            ) : (
              <><Download size={18} /> PNG 다운로드</>
            )}
          </button>

          {/* 포맷 선택 토글 */}
          <button
            title="다운로드 형식 선택"
            onClick={() => setShowDropdown(v => !v)}
            disabled={isDownloading}
            className="flex items-center px-3 py-3 text-white shadow-lg hover:brightness-110 transition-all duration-200 disabled:opacity-60"
            style={{ backgroundColor: formData.primaryColor, borderRadius: "0 8px 8px 0", borderLeft: "1px solid rgba(255,255,255,0.3)", border: "none", cursor: isDownloading ? "not-allowed" : "pointer" }}
          >
            <ChevronDown size={16} style={{ transform: showDropdown ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>

          {/* 드롭다운 */}
          {showDropdown && (
            <div className="absolute bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50" style={{ bottom: "calc(100% + 8px)", right: 0, minWidth: "190px" }}>
              <div className="px-3 py-2 text-xs text-gray-400 font-semibold tracking-wide border-b border-gray-50">
                다운로드 형식 선택
              </div>
              {[
                { label: "PNG 이미지", desc: "고화질 · 투명 배경", icon: <ImageIcon size={15} />, fmt: "png" as const },
                { label: "JPEG 이미지", desc: "작은 파일 크기", icon: <ImageIcon size={15} />, fmt: "jpeg" as const },
                { label: "PDF 문서", desc: "인쇄용 · 표준 규격", icon: <FileText size={15} />, fmt: "pdf" as const },
              ].map(({ label, desc, icon, fmt }) => (
                <button
                  key={fmt}
                  onClick={() => doCapture(fmt)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  style={{ border: "none", cursor: "pointer", background: "none" }}
                >
                  <span style={{ color: formData.primaryColor }}>{icon}</span>
                  <span>
                    <div className="text-sm font-semibold text-gray-800">{label}</div>
                    <div className="text-xs text-gray-400">{desc}</div>
                  </span>
                </button>
              ))}
              <div className="border-t border-gray-100 mx-3 my-1" />
              <button
                onClick={doRecord}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50 transition-colors"
                style={{ border: "none", cursor: "pointer", background: "none" }}
              >
                <span style={{ color: "#7c3aed" }}><Video size={15} /></span>
                <span>
                  <div className="text-sm font-semibold text-gray-800">WebM 영상</div>
                  <div className="text-xs text-gray-400">3D 애니메이션 · 4초 녹화</div>
                </span>
              </button>
              <div className="border-t border-gray-100 mx-3 my-1" />
              <button
                onClick={() => { setShowDropdown(false); exportToHtml(formData); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 transition-colors"
                style={{ border: "none", cursor: "pointer", background: "none" }}
              >
                <span style={{ color: "#059669" }}><Code2 size={15} /></span>
                <span>
                  <div className="text-sm font-semibold text-gray-800">HTML 파일</div>
                  <div className="text-xs text-gray-400">오프라인 동작 · 카톡/메일 공유용</div>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 해상도 안내 */}
      <p className="text-center text-xs text-gray-400 mt-2">
        출력 해상도: {CARD_W_PX} × {CARD_H_PX}px (300 DPI · 표준 명함 규격)
      </p>

      {/* ── 공유 버튼 (에디터 모드에서만 표시) ── */}
      {!isPreviewMode && (
      <div className="mt-4 flex flex-col items-center gap-2">
        {/* HTML 내보내기 버튼 */}
        <button
          onClick={() => exportToHtml(formData)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 text-white w-full max-w-sm justify-center"
          style={{ backgroundColor: "#059669" }}
        >
          <Code2 size={18} /> HTML로 내보내기
        </button>
        <p className="text-xs text-gray-400 text-center max-w-xs leading-relaxed">
          📁 단일 .html 파일 생성 — 카카오톡·메일·USB로 공유,<br />받는 사람이 브라우저에서 바로 오프라인 열람 가능
        </p>
        <div className="w-full max-w-sm border-t border-gray-100 my-1" />
        <button
          onClick={doShare}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 text-white"
          style={{ backgroundColor: shareState === 'copied' ? '#16a34a' : '#7c3aed' }}
        >
          {shareState === 'copied' ? (
            <><Check size={18} /> 링크 복사 완료!</>
          ) : (
            <><Share2 size={18} /> 저장 & 공유 링크 생성</>
          )}
        </button>

        {/* 복사된 URL 표시 */}
        {shareState === 'copied' && savedId && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 w-full max-w-sm">
            <span className="text-xs text-green-700 truncate flex-1">
              {window.location.origin}/preview/{savedId}
            </span>
          </div>
        )}

        {/* 로컬 스토리지 안내 */}
        <p className="text-xs text-gray-400 text-center max-w-xs leading-relaxed">
          ⚠️ 이 링크는 <strong>이 브라우저</strong>에서만 열립니다.<br />
          다른 기기 공유는 PNG · PDF · WebM 파일로 저장하세요.
        </p>
      </div>
      )}

      <p className="text-center text-sm text-gray-400 mt-3 animate-pulse">
        ✦ 명함 위에 마우스를 올려보세요
      </p>

      <style>{`@keyframes card-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}