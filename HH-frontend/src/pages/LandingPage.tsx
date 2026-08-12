import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import HeroSlab from '../components/3d/HeroSlab';
import ParticleField from '../components/3d/ParticleField';
import TiltCard from '../components/TiltCard';
import { api, API_BASE } from '../lib/api';
import { CardData } from '../types';
import { ArrowRight, Image as ImageIcon, CreditCard } from 'lucide-react';

interface Stats {
  total_generations: number;
  today: number;
}

const SHOWCASE_CARDS: CardData[] = [
  {
    id: 'demo-1', format: 'format_b',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    name: 'Ananya Roy', role: 'AI / Full Stack Developer', title: 'Gradient Descender 📉',
    handle: '@ananyaroy_dev', theme: 'cyan_surf', cardNo: 1042,
    generatedAt: new Date(Date.now() - 3600000 * 2).toISOString(), downloadCount: 14, shareCount: 8, deviceType: 'desktop',
  },
  {
    id: 'demo-2', format: 'format_a',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    name: 'Arjun Sharma', role: 'Backend Barbarian ⚔️', title: 'Backend Barbarian ⚔️',
    handle: '@arjun_bytes', theme: 'ember_bonfire', cardNo: 1043,
    generatedAt: new Date(Date.now() - 3600000 * 4).toISOString(), downloadCount: 22, shareCount: 12, deviceType: 'mobile',
  },
  {
    id: 'demo-3', format: 'format_b',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    name: 'Priya Nambiar', role: 'Frontend Architect · React', title: 'Pixel Whisperer 🎨',
    handle: '@priya_ux', theme: 'sand_dunes', cardNo: 1044,
    generatedAt: new Date(Date.now() - 3600000 * 6).toISOString(), downloadCount: 19, shareCount: 11, deviceType: 'mobile',
  },
  {
    id: 'demo-4', format: 'format_a',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    name: 'Vikram Mehta', role: 'Founder & CEO @ ShipFast', title: 'Ship or Die Captain 🚢',
    handle: '@v_mehta', theme: 'neon_palm', cardNo: 1045,
    generatedAt: new Date(Date.now() - 3600000 * 12).toISOString(), downloadCount: 31, shareCount: 18, deviceType: 'desktop',
  },
  {
    id: 'demo-5', format: 'format_b',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    name: 'Sarah Chen', role: 'Rust & Security Protocol Lead', title: 'Borrow Checker Slayer 🦀',
    handle: '@sarah_rust', theme: 'cyan_surf', cardNo: 1046,
    generatedAt: new Date(Date.now() - 3600000 * 16).toISOString(), downloadCount: 28, shareCount: 15, deviceType: 'mobile',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ total_generations: 1247, today: 89 });
  const [showcaseCards] = useState<CardData[]>(SHOWCASE_CARDS);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<Stats>('/api/stats');
        setStats(data);
      } catch {
        // Keep default stats on error
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const headlineText = "Your Goa Identity Lives Here";

  return (
    <div className="relative min-h-screen pt-20 overflow-hidden bg-[#0a0a0a] text-[#d4d4d4]">
      <ParticleField />

      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-16 pb-16 md:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-80px)]">
        <motion.div
          className="lg:col-span-7 flex flex-col items-start"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="px-4 py-1.5 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059] font-mono text-xs uppercase font-semibold tracking-widest mb-6 flex items-center gap-2 shadow-[0_0_20px_rgba(197,160,89,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-ping" />
            <span>HH GOA 2026 · BUILDPASS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-semibold font-serif tracking-tight text-white leading-[1.15] mb-6">
            {headlineText.split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.025, duration: 0.4 }}
                className={char === "G" || char === "o" || char === "a" ? "text-gradient-gold italic font-normal inline-block" : "inline-block"}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </h1>

          <p className="text-base sm:text-xl text-[#d4d4d4]/80 mb-8 max-w-2xl font-sans leading-relaxed">
            Upload a photo <span className="text-[#c5a059]">→</span> instant 1080p branded card <span className="text-[#c5a059]">→</span> share on X. Built for Goan hackers in under 60 seconds.
          </p>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={() => navigate('/sign-in')}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[#c5a059] via-[#e6ca85] to-[#8e723d] text-[#0a0a0a] font-sans font-semibold text-lg shadow-[0_0_30px_rgba(197,160,89,0.35)] hover:shadow-[0_0_50px_rgba(197,160,89,0.55)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              <span>Create My Card</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="px-5 py-3 rounded-full bg-[#121212]/90 border border-white/10 text-[#d4d4d4] font-mono text-xs sm:text-sm flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
              <span>↗ {stats.total_generations.toLocaleString()} cards made</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-5 w-full flex justify-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <HeroSlab />
        </motion.div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#c5a059] tracking-widest uppercase block mb-2">
            SELECT YOUR VIBE
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold font-serif text-white">
            Two High-Def Formats
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <TiltCard onClick={() => navigate('/sign-in')}>
            <div className="glass p-8 rounded-3xl border border-white/10 hover:border-[#c5a059] transition-colors relative overflow-hidden group">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059] font-mono text-xs">
                Format A · 1080×1080
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059] flex items-center justify-center mb-6">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold font-serif text-white mb-2">PFP Frame Overlay</h3>
              <p className="text-sm text-[#d4d4d4]/70 mb-6">
                Square 1:1 avatar frame with refined gold borders and custom builder tag. Perfect for X avatar or Instagram profile.
              </p>
              <div className="w-full h-48 rounded-2xl bg-[#121212] border border-white/10 p-4 flex items-center justify-center relative group-hover:scale-105 transition-transform">
                <div className="w-32 h-32 rounded-3xl border-2 border-[#c5a059] p-1 flex items-center justify-center bg-[#181818] relative overflow-hidden shadow-[0_0_20px_rgba(197,160,89,0.3)]">
                  <span className="text-4xl">🏄‍♂️</span>
                  <div className="absolute bottom-1 px-2 py-0.5 rounded bg-[#0a0a0a] text-[9px] font-mono text-[#c5a059] border border-[#c5a059]/50">
                    HH GOA 2026
                  </div>
                </div>
              </div>
            </div>
          </TiltCard>

          <TiltCard onClick={() => navigate('/sign-in')}>
            <div className="glass p-8 rounded-3xl border border-white/10 hover:border-[#e6ca85] transition-colors relative overflow-hidden group">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#e6ca85]/10 border border-[#e6ca85]/30 text-[#e6ca85] font-mono text-xs">
                Format B · 1080×1350
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#e6ca85]/10 border border-[#e6ca85]/30 text-[#e6ca85] flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold font-serif text-white mb-2">Builder ID Card</h3>
              <p className="text-sm text-[#d4d4d4]/70 mb-6">
                Portrait 4:5 official hacker pass with name, role title, custom handle, and holographic QR verification seal.
              </p>
              <div className="w-full h-48 rounded-2xl bg-[#121212] border border-white/10 p-4 flex items-center justify-center relative group-hover:scale-105 transition-transform">
                <div className="w-28 h-36 rounded-2xl border-2 border-[#e6ca85] p-2 bg-[#181818] flex flex-col justify-between shadow-[0_0_20px_rgba(230,202,133,0.3)]">
                  <div className="flex justify-between items-center text-[8px] font-mono text-[#e6ca85]">
                    <span>HH GOA</span>
                    <span>PASS</span>
                  </div>
                  <div className="w-full h-16 rounded-lg bg-[#222222] flex items-center justify-center text-xl">
                    🧑‍💻
                  </div>
                  <div className="text-[9px] font-mono text-white font-bold truncate">BUILDER PASS</div>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#c5a059] tracking-widest uppercase block mb-2">3-STEP FLOW</span>
          <h2 className="text-3xl sm:text-4xl font-semibold font-serif text-white">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {[
            { num: '01', title: 'Upload Photo', desc: 'Drop any selfie or avatar (JPG, PNG, HEIC supported). Instant smart crop.' },
            { num: '02', title: 'Customize Details', desc: 'Enter your name, role, and twitter handle. Auto-generates your builder title.' },
            { num: '03', title: 'Download & Share', desc: 'Download high-res PNG and post directly to X with pre-filled #FrameInGoa tag.' },
          ].map((step, idx) => (
            <div key={idx} className="glass p-8 rounded-3xl border border-white/10 relative">
              <span className="text-7xl font-bold font-serif text-white/5 absolute top-4 right-6 pointer-events-none select-none">{step.num}</span>
              <div className={`w-12 h-12 rounded-2xl bg-[#${['c5a059', 'e6ca85', 'f0db9e'][idx]}]/10 text-[#${['c5a059', 'e6ca85', 'f0db9e'][idx]}] flex items-center justify-center mb-6 font-bold text-xl border border-[#${['c5a059', 'e6ca85', 'f0db9e'][idx]}]/20`}>
                {idx + 1}
              </div>
              <h3 className="text-xl font-semibold font-serif text-white mb-2">{step.title}</h3>
              <p className="text-sm text-[#d4d4d4]/70">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 py-20 border-t border-white/10 overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-12 px-4">
          <span className="text-xs font-mono text-[#c5a059] tracking-widest uppercase block mb-2">WALL OF BUILDERS</span>
          <h2 className="text-3xl sm:text-4xl font-semibold font-serif text-white">Created for Goa Hackers</h2>
        </div>
        <div className="space-y-6">
          <div className="animate-marquee-left flex gap-6">
            {[...showcaseCards, ...showcaseCards].map((card, idx) => (
              <div key={`m1-${card.id}-${idx}`} className="w-64 h-80 rounded-2xl bg-[#121212] border border-white/10 p-4 flex flex-col justify-between shrink-0 hover:border-[#c5a059] transition-colors">
                <div className="w-full h-48 rounded-xl bg-[#181818] overflow-hidden relative">
                  <img src={card.photoUrl} alt={card.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#0a0a0a]/80 backdrop-blur-md text-[10px] font-mono text-[#c5a059] border border-[#c5a059]/30">HH GOA</div>
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-white text-base truncate">{card.name}</h4>
                  <p className="font-mono text-xs text-[#c5a059] truncate">{card.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
