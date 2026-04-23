import { BusinessCardPreview } from '../components/BusinessCardPreview';
import { useState, useEffect } from 'react';
import { Share2, Check, AlertCircle } from 'lucide-react';
import { fetchCard, saveCard, CardData } from '../utils/shareCard';

export default function PreviewPage() {
  const [formData, setFormData] = useState<CardData | null>(null);
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const id = window.location.pathname.split('/preview/')[1];
    if (!id) { setError(true); return; }
    fetchCard(id).then(data => {
      if (data) setFormData(data);
      else setError(true);
    });
  }, []);

  const doSaveAsMine = async () => {
    if (!formData) return;
    try {
      const id = await saveCard(formData);
      setSavedId(id);
      const url = `${window.location.origin}/preview/${id}`;
      try { await navigator.clipboard.writeText(url); }
      catch { prompt("아래 URL을 복사하세요:", url); return; }
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 3000);
    } catch {
      alert('저장에 실패했습니다.');
    }
  };

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
      <AlertCircle size={40} className="text-red-400" />
      <p className="text-lg font-semibold">명함을 찾을 수 없습니다.</p>
      <p className="text-sm">링크가 만료되었거나 잘못된 주소입니다.</p>
    </div>
  );

  if (!formData) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      명함 불러오는 중...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <BusinessCardPreview formData={formData} isPreviewMode={true} />
        
        {/* 공유받은 사람 전용 버튼 */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            onClick={doSaveAsMine}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 text-white"
            style={{ backgroundColor: shareState === 'copied' ? '#16a34a' : '#7c3aed' }}
          >
            {shareState === 'copied' ? (
              <><Check size={18} /> 내 것으로 저장 완료!</>
            ) : (
              <><Share2 size={18} /> 이 명함을 내 것으로 저장</>
            )}
          </button>

          {shareState === 'copied' && savedId && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 w-full max-w-sm">
              <span className="text-xs text-green-700 truncate flex-1">
                {window.location.origin}/preview/{savedId}
              </span>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center max-w-xs leading-relaxed">
            이 명함을 저장하면 <strong>나만의 공유 링크</strong>가 생성됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}