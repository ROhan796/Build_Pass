import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { Waves, Shield, PlusCircle, LogIn } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  const currentRoute = location.pathname;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 md:h-20 flex items-center px-4 md:px-8 border-b ${
        isScrolled
          ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/80'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Left: Brand Logo + Name */}
        <button onClick={() => navigate('/')} className="flex items-center gap-3 group text-left focus:outline-none shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#121212] border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] group-hover:scale-105 group-hover:border-[#c5a059] group-hover:shadow-[0_0_20px_rgba(197,160,89,0.35)] transition-all">
            <Waves className="w-5 h-5 animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-serif font-semibold text-lg md:text-xl text-white tracking-wider group-hover:text-[#c5a059] transition-colors">
                BuildPass
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059] font-mono text-[10px] uppercase font-semibold tracking-widest">
                HH GOA
              </span>
            </div>
            <span className="text-xs text-[#d4d4d4]/70 tracking-wide">
              Builder Identity Card Generator
            </span>
          </div>
        </button>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Admin button */}
          {currentRoute !== '/admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#121212] border border-white/10 hover:border-[#c5a059]/50 text-xs sm:text-sm font-sans text-[#d4d4d4] hover:text-[#c5a059] transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Loading skeleton */}
          {!isLoaded && (
            <div className="w-20 h-8 rounded-full bg-[#121212] animate-pulse" />
          )}

          {/* Logged in — Create Card + UserButton (profile dropdown) */}
          {isLoaded && isSignedIn && (
            <>
              {currentRoute !== '/create' && (
                <button
                  onClick={() => navigate('/create')}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#c5a059] to-[#8e723d] text-[#0a0a0a] font-semibold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(197,160,89,0.5)] active:scale-95 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Card</span>
                </button>
              )}

              {/* Clerk UserButton — shows avatar, click opens profile dropdown */}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9 rounded-full border-2 border-[#c5a059]/40 hover:border-[#c5a059] transition-colors',
                  },
                }}
              />
            </>
          )}

          {/* Not logged in — Sign In */}
          {isLoaded && !isSignedIn && (
            <button
              onClick={() => navigate('/sign-in')}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#c5a059] to-[#8e723d] text-[#0a0a0a] font-semibold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(197,160,89,0.5)] active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
