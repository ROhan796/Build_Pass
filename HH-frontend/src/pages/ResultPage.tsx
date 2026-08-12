import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CardData } from '../types';
import { api, API_BASE } from '../lib/api';
import TiltCard from '../components/TiltCard';
import { Download, Share2, Copy, Check, PlusCircle, ArrowLeft, Sparkles, Twitter } from 'lucide-react';

export default function ResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cardId = searchParams.get('id');

  const [card, setCard] = useState<CardData | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!cardId) return;

    const foundLocal = (() => {
      try {
        const raw = localStorage.getItem('hhgoa_cards_v1');
        if (!raw) return null;
        const cards = JSON.parse(raw);
        return Array.isArray(cards) ? cards.find((c: CardData) => c.id === cardId) : null;
      } catch { return null; }
    })();

    if (foundLocal) {
      setCard(foundLocal);
      return;
    }

    const fetchFromBackend = async () => {
      try {
        const data = await api.get<{ share_id: string; image_url: string; name: string; format: string; title?: string }>(
          `/api/generate?share_id=${cardId}`
        );
      } catch {
        // Card not found in backend either
      }
    };
    fetchFromBackend();
  }, [cardId]);

  const tweetText = `Just got my HH Goa 2026 builder card! 🏄‍♂️\nSee you in Goa! #FrameInGoa #HackerHouse`;
  const shareUrl = card ? `${window.location.origin}/share/${card.id}` : window.location.origin;

  const handleDownload = async () => {
    if (!card) return;
    setIsDownloading(true);

    try {
      if (card.imageDataUrl) {
        const a = document.createElement('a');
        a.href = card.imageDataUrl;
        a.download = `HH_GOA_2026_${card.name.replace(/\s+/g, '_')}_${card.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      try { await api.post(`/api/track/${card.id}/download`); } catch {}

      setIsDownloading(false);
      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 2500);
    } catch (e) {
      console.error('Download error:', e);
      setIsDownloading(false);
    }
  };

  const handleShareToX = async () => {
    if (!card) return;
    const shareColors = ['#c5a059', '#e6ca85', '#8e723d', '#FFFFFF', '#f0db9e'];
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: shareColors });

    try { await api.post(`/api/track/${card.id}/share`); } catch {}

    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(intentUrl, '_blank');
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(`${tweetText}\n${shareUrl}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!card) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 text-center flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="w-16 h-16 rounded-full bg-[#121212] border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-semibold font-serif text-white mb-2">Card Not Found</h2>
        <p className="text-sm text-[#d4d4d4]/70 mb-6">Create a new card in under 60 seconds.</p>
        <button onClick={() => navigate('/create')} className="px-6 py-3 rounded-full bg-[#c5a059] text-[#0a0a0a] font-semibold text-sm">
          Create My Card
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto bg-[#0a0a0a] text-[#d4d4d4]">
      <button onClick={() => navigate('/create')} className="inline-flex items-center gap-2 font-sans text-xs text-[#d4d4d4]/70 hover:text-[#c5a059] transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Create Another Card</span>
      </button>

      <div className="text-center mb-10">
        <span className="text-xs font-mono text-[#c5a059] tracking-widest uppercase block mb-1">GENERATION COMPLETE</span>
        <h1 className="text-3xl md:text-5xl font-semibold font-serif text-white">Here's Your Card</h1>
      </div>

      <div className="max-w-[480px] mx-auto mb-10 card-flip-enter">
        <TiltCard strength={10}>
          <div className="glass p-3 rounded-3xl border border-[#c5a059]/30 shadow-[0_0_50px_rgba(197,160,89,0.2)]">
            {card.imageDataUrl ? (
              <img src={card.imageDataUrl} alt={card.name} className="w-full h-auto rounded-2xl shadow-2xl" />
            ) : (
              <div className="w-full aspect-[4/5] rounded-2xl bg-[#121212] flex items-center justify-center">
                <span className="font-mono text-sm text-[#d4d4d4]/70">Generating HD graphic...</span>
              </div>
            )}
          </div>
        </TiltCard>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full h-15 rounded-full bg-gradient-to-r from-[#c5a059] via-[#e6ca85] to-[#8e723d] text-[#0a0a0a] font-sans font-semibold text-lg shadow-[0_0_30px_rgba(197,160,89,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {isDownloaded ? (
            <><Check className="w-5 h-5 text-[#0a0a0a]" /><span>Downloaded!</span></>
          ) : isDownloading ? (
            <span>Preparing PNG...</span>
          ) : (
            <><Download className="w-5 h-5" /><span>Download PNG</span></>
          )}
        </button>

        <button
          onClick={handleShareToX}
          className="w-full h-14 rounded-full bg-[#121212] border border-white/20 text-white font-sans font-semibold text-base hover:bg-[#181818] hover:border-[#c5a059]/40 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg"
        >
          <Twitter className="w-5 h-5 fill-white text-white" />
          <span>Share to 𝕏 (#FrameInGoa)</span>
        </button>

        <div className="p-4 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-between gap-3 text-xs font-mono text-[#d4d4d4]/70">
          <span className="truncate">{tweetText}</span>
          <button
            onClick={handleCopyCaption}
            className="px-3 py-1.5 rounded-lg bg-[#181818] border border-white/10 text-[#c5a059] hover:border-[#c5a059] transition-colors flex items-center gap-1 shrink-0"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="pt-4 text-center">
          <button onClick={() => navigate('/create')} className="inline-flex items-center gap-2 font-sans text-xs text-[#d4d4d4]/70 hover:text-white transition-colors">
            <PlusCircle className="w-4 h-4" />
            <span>Make another card</span>
          </button>
        </div>
      </div>
    </div>
  );
}
