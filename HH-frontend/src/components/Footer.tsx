import React from 'react';
import { Waves, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a] py-12 px-4 md:px-8 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#121212] border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
            <Waves className="w-4 h-4" />
          </div>
          <span className="font-serif font-semibold text-lg text-white tracking-wider">
            BuildPass
          </span>
          <span className="text-xs font-sans text-[#d4d4d4]/60 ml-2 border-l border-white/10 pl-3">
            HH Goa 2026 · Goa, India
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs font-sans text-[#d4d4d4]/60">
          <span className="px-3 py-1 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/20 text-[#c5a059] font-mono tracking-widest uppercase">
            #FrameInGoa
          </span>
          <span>Zero-Friction Builder Identity</span>
        </div>

        <div className="text-xs font-sans text-[#d4d4d4]/60 flex items-center gap-1.5">
          <span>Crafted for Builders with</span>
          <Heart className="w-3.5 h-3.5 text-[#c5a059] fill-[#c5a059]" />
        </div>
      </div>
    </footer>
  );
}
