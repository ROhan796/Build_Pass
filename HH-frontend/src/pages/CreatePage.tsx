import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import heic2any from 'heic2any';
import { CardFormat, CardTheme, CardData } from '../types';
import { getBuilderTitle } from '../lib/builderTitles';
import { renderCardToCanvas, PhotoTransform } from '../lib/canvasRenderer';
import { api, API_BASE } from '../lib/api';
import { Upload, Sparkles, Image as ImageIcon, CreditCard, Move, ZoomIn, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';

const THEME_OPTIONS: { id: CardTheme; label: string; bg: string; border: string }[] = [
  { id: 'cyan_surf', label: 'Gold Obsidian', bg: 'bg-[#c5a059]', border: 'border-[#c5a059]' },
  { id: 'ember_bonfire', label: 'Amber Bronze', bg: 'bg-[#d4af37]', border: 'border-[#d4af37]' },
  { id: 'sand_dunes', label: 'Champagne Sand', bg: 'bg-[#e8c97a]', border: 'border-[#e8c97a]' },
  { id: 'neon_palm', label: 'Emerald Gold', bg: 'bg-[#b89756]', border: 'border-[#b89756]' },
];

export default function CreatePage() {
  const navigate = useNavigate();
  const [format, setFormat] = useState<CardFormat>('format_b');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);

  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [handle, setHandle] = useState<string>('');
  const [theme, setTheme] = useState<CardTheme>('cyan_surf');

  const [transform, setTransform] = useState<PhotoTransform>({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const computedTitle = customTitle.trim() ? customTitle : getBuilderTitle(role);

  useEffect(() => {
    if (!photoUrl) {
      setPhotoImage(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photoUrl;
    img.onload = () => setPhotoImage(img);
  }, [photoUrl]);

  const updatePreview = useCallback(() => {
    if (!canvasRef.current) return;
    renderCardToCanvas(
      canvasRef.current,
      {
        format,
        photoImage,
        name: name || 'YOUR NAME',
        role: role || 'Full Stack · React · Python',
        title: computedTitle,
        handle: handle ? (handle.startsWith('@') ? handle : `@${handle}`) : '',
        theme,
        cardNo: 1048,
      },
      transform,
      false
    );
  }, [format, photoImage, name, role, computedTitle, handle, theme, transform]);

  useEffect(() => { updatePreview(); }, [updatePreview]);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("That photo's too large. Max 20MB — try compressing it first.");
      return;
    }
    const fileName = file.name.toLowerCase();
    setIsProcessingPhoto(true);
    try {
      let finalBlob: Blob = file;
      if (fileName.endsWith('.heic') || fileName.endsWith('.heif') || file.type === 'image/heic') {
        const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
        finalBlob = Array.isArray(converted) ? converted[0] : converted;
      }
      const objectUrl = URL.createObjectURL(finalBlob);
      setPhotoUrl(objectUrl);
      setTransform({ zoom: 1, offsetX: 0, offsetY: 0 });
    } catch (err) {
      console.error('Photo processing error:', err);
      setErrorMsg('Could not process that image. Please select a JPG or PNG photo.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!photoImage) {
      setErrorMsg('Please upload a photo first to create your card.');
      return;
    }
    if (format === 'format_b' && !name.trim()) {
      setErrorMsg("Can't make your card without a name.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const exportCanvas = document.createElement('canvas');
      const cardNo = Math.floor(1000 + Math.random() * 8999);

      await renderCardToCanvas(
        exportCanvas,
        {
          format,
          photoImage,
          name: name.trim() || 'HH GOA BUILDER',
          role: role.trim() || 'Hacker Extraordinaire',
          title: computedTitle,
          handle: handle.trim() ? (handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`) : '',
          theme,
          cardNo,
        },
        transform,
        true
      );

      const generatedImageDataUrl = exportCanvas.toDataURL('image/png', 1.0);

      let backendResult: { share_id: string; image_url: string; download_url: string } | null = null;

      try {
        const formData = new FormData();

        const res = await fetch(generatedImageDataUrl);
        const blob = await res.blob();
        formData.append('image', blob, 'card.png');
        formData.append('format', format === 'format_a' ? 'A' : 'B');
        if (name.trim()) formData.append('name', name.trim());
        if (role.trim()) formData.append('role', role.trim());
        if (handle.trim()) formData.append('handle', handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`);
        formData.append('theme', theme);

        backendResult = await api.postForm('/api/generate', formData);
      } catch (apiErr) {
        console.warn('Backend unavailable, using local mode:', apiErr);
      }

      const cardId = backendResult?.share_id || `card-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const imageUrl = backendResult?.image_url || generatedImageDataUrl;

      const newCard: CardData = {
        id: cardId,
        format,
        photoUrl: photoUrl || '',
        name: name.trim() || 'HH GOA BUILDER',
        role: role.trim() || 'Hacker Extraordinaire',
        title: computedTitle,
        handle: handle.trim() ? (handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`) : '',
        theme,
        cardNo,
        generatedAt: new Date().toISOString(),
        downloadCount: 0,
        shareCount: 0,
        imageDataUrl: generatedImageDataUrl,
        deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
      };

      try {
        const existing = JSON.parse(localStorage.getItem('hhgoa_cards_v1') || '[]');
        const updated = [newCard, ...existing.filter((c: CardData) => c.id !== newCard.id)];
        localStorage.setItem('hhgoa_cards_v1', JSON.stringify(updated.slice(0, 50)));
      } catch {}

      setTimeout(() => {
        setIsGenerating(false);
        navigate(`/result?id=${cardId}`);
      }, 500);
    } catch (e) {
      console.error('Card generation failed:', e);
      setErrorMsg('Card generation failed. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto bg-[#0a0a0a] text-[#d4d4d4]">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-[#c5a059] tracking-widest uppercase block mb-1">CREATION STUDIO</span>
          <h1 className="text-3xl md:text-5xl font-semibold font-serif text-white">Make Your Card</h1>
        </div>
        <div className="inline-flex p-1 rounded-full bg-[#121212] border border-white/10">
          <button
            onClick={() => setFormat('format_a')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-sans text-xs sm:text-sm transition-all ${
              format === 'format_a'
                ? 'bg-gradient-to-r from-[#c5a059] to-[#8e723d] text-[#0a0a0a] font-semibold shadow-[0_0_20px_rgba(197,160,89,0.3)]'
                : 'text-[#d4d4d4] hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>PFP Frame (1:1)</span>
          </button>
          <button
            onClick={() => setFormat('format_b')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-sans text-xs sm:text-sm transition-all ${
              format === 'format_b'
                ? 'bg-gradient-to-r from-[#c5a059] to-[#8e723d] text-[#0a0a0a] font-semibold shadow-[0_0_20px_rgba(197,160,89,0.3)]'
                : 'text-[#d4d4d4] hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Builder Card (4:5)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-200 text-sm font-sans flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="font-mono text-xs underline">Dismiss</button>
            </div>
          )}

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-3xl p-8 border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center min-h-[220px] ${
              isDraggingOver
                ? 'border-[#c5a059] bg-[#c5a059]/5 scale-[1.02] shadow-[0_0_30px_rgba(197,160,89,0.2)]'
                : photoUrl
                ? 'border-[#c5a059] bg-[#121212]'
                : 'border-white/10 bg-[#121212]/60 hover:border-[#c5a059]/50 hover:bg-[#121212]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/heic,image/heif"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
            {isProcessingPhoto ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-[#c5a059] animate-spin" />
                <span className="font-mono text-sm text-[#c5a059]">Optimising photo...</span>
              </div>
            ) : photoUrl ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <img src={photoUrl} alt="Uploaded photo" className="w-20 h-20 rounded-2xl object-cover border border-[#c5a059]" />
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2 text-[#c5a059] font-mono text-xs uppercase font-semibold mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Photo Ready</span>
                  </div>
                  <p className="text-xs text-[#d4d4d4]/70">Tap or drop another file to change photo</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059] flex items-center justify-center mb-4">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="font-serif font-semibold text-xl text-white mb-1">Drop your photo here</h3>
                <p className="text-xs font-mono text-[#d4d4d4]/70">or tap to choose · JPG, PNG, HEIC · max 20MB</p>
              </>
            )}
          </div>

          {photoUrl && (
            <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-[#c5a059]">
                <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Adjust Photo Position & Scale</span>
                <button onClick={() => setTransform({ zoom: 1, offsetX: 0, offsetY: 0 })} className="hover:underline text-[#d4d4d4]/70">Reset</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono text-[#d4d4d4]/70 block mb-1">Zoom ({transform.zoom.toFixed(1)}x)</label>
                  <input type="range" min="0.5" max="2.5" step="0.05" value={transform.zoom}
                    onChange={(e) => setTransform({ ...transform, zoom: parseFloat(e.target.value) })} className="w-full accent-[#c5a059]" />
                </div>
                <div>
                  <label className="text-xs font-mono text-[#d4d4d4]/70 block mb-1">Pan Horizontal ({transform.offsetX}px)</label>
                  <input type="range" min="-150" max="150" step="2" value={transform.offsetX}
                    onChange={(e) => setTransform({ ...transform, offsetX: parseInt(e.target.value) })} className="w-full accent-[#c5a059]" />
                </div>
                <div>
                  <label className="text-xs font-mono text-[#d4d4d4]/70 block mb-1">Pan Vertical ({transform.offsetY}px)</label>
                  <input type="range" min="-150" max="150" step="2" value={transform.offsetY}
                    onChange={(e) => setTransform({ ...transform, offsetY: parseInt(e.target.value) })} className="w-full accent-[#c5a059]" />
                </div>
              </div>
            </div>
          )}

          <div className="p-6 rounded-3xl bg-[#121212] border border-white/10 space-y-5">
            <h3 className="font-serif font-semibold text-lg text-white">Card Metadata</h3>
            <div>
              <label className="block text-xs font-mono text-[#d4d4d4]/70 uppercase tracking-wider mb-2">Your Name <span className="text-[#c5a059]">*</span></label>
              <input type="text" placeholder="e.g. Arjun Sharma" value={name} onChange={(e) => setName(e.target.value)} maxLength={30}
                className="w-full h-12 rounded-xl bg-[#0a0a0a] border border-white/10 focus:border-[#c5a059] focus:outline-none px-4 text-white font-sans text-sm transition-colors" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#d4d4d4]/70 uppercase tracking-wider mb-2">Role / Stack</label>
                <input type="text" placeholder="e.g. Full Stack · React · Python" value={role} onChange={(e) => setRole(e.target.value)} maxLength={40}
                  className="w-full h-12 rounded-xl bg-[#0a0a0a] border border-white/10 focus:border-[#c5a059] focus:outline-none px-4 text-white font-sans text-sm transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#d4d4d4]/70 uppercase tracking-wider mb-2">𝕏 Handle</label>
                <input type="text" placeholder="e.g. @arjun_sharma" value={handle} onChange={(e) => setHandle(e.target.value)} maxLength={25}
                  className="w-full h-12 rounded-xl bg-[#0a0a0a] border border-white/10 focus:border-[#c5a059] focus:outline-none px-4 text-white font-sans text-sm transition-colors" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#d4d4d4]/60 uppercase tracking-widest block">Auto-Generated Builder Title</span>
                <span className="font-mono text-sm font-semibold text-[#c5a059]">{computedTitle}</span>
              </div>
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#d4d4d4]/70 uppercase tracking-wider mb-2">Color Palette</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {THEME_OPTIONS.map((t) => (
                  <button key={t.id} type="button" onClick={() => setTheme(t.id)}
                    className={`h-11 rounded-xl border flex items-center justify-center gap-2 font-mono text-xs transition-all ${
                      theme === t.id
                        ? `${t.border} bg-[#181818] text-white shadow-[0_0_15px_rgba(197,160,89,0.2)] font-bold`
                        : 'border-white/10 text-[#d4d4d4]/70 hover:border-[#c5a059]/40'
                    }`}>
                    <span className={`w-3 h-3 rounded-full ${t.bg}`} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !photoImage}
            className={`w-full h-16 rounded-full font-sans font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
              !photoImage
                ? 'bg-[#181818] text-[#555] cursor-not-allowed border border-white/5'
                : 'bg-gradient-to-r from-[#c5a059] via-[#e6ca85] to-[#8e723d] text-[#0a0a0a] shadow-[0_0_30px_rgba(197,160,89,0.35)] hover:shadow-[0_0_50px_rgba(197,160,89,0.55)] hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <><RefreshCw className="w-5 h-5 animate-spin text-[#0a0a0a]" /><span>Making your card...</span></>
            ) : (
              <><span>Generate My Card</span><ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </div>

        <div className="lg:col-span-5 sticky top-28">
          <div className="p-6 rounded-3xl glass border border-white/10 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-[#c5a059] tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-ping" /> Live Preview
              </span>
              <span className="text-xs font-mono text-[#d4d4d4]/70">{format === 'format_a' ? '1080×1080' : '1080×1350'}</span>
            </div>
            <div className="w-full max-w-[380px] aspect-[4/5] rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-2xl flex items-center justify-center p-2">
              <canvas ref={canvasRef} className="w-full h-auto max-h-full object-contain rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
