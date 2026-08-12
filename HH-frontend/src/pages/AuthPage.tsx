import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Waves, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const clerkAppearance = {
  variables: {
    colorPrimary: '#c5a059',
    colorBackground: '#121212',
    colorInputBackground: '#0a0a0a',
    colorText: '#ffffff',
    colorTextSecondary: '#d4d4d4',
    borderRadius: '1rem',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  elements: {
    rootBox: 'mx-auto w-full',
    card: '!bg-[#121212] !border !border-white/10 !shadow-[0_25px_60px_rgba(0,0,0,0.6)] !rounded-2xl',
    headerTitle: '!text-white !font-serif !text-xl !font-semibold',
    headerSubtitle: '!text-[#d4d4d4]/70 !text-sm',
    formFieldLabel: '!text-[#d4d4d4]/70 !text-xs !font-medium !mb-1.5',
    formFieldInput: '!bg-[#0a0a0a] !border !border-white/10 !text-white !rounded-xl !h-12 !px-4 !text-sm focus:!border-[#c5a059] focus:!ring-1 focus:!ring-[#c5a059]/30 !transition-all !outline-none',
    formButtonPrimary: '!bg-gradient-to-r !from-[#c5a059] !to-[#8e723d] hover:!from-[#d4b06a] hover:!to-[#9e824d] !text-[#0a0a0a] !font-semibold !rounded-full !h-12 !text-sm !tracking-wide !shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:!shadow-[0_0_30px_rgba(197,160,89,0.5)] !transition-all !border-0',
    socialButtonsBlockButton: '!border-white/10 !text-white !bg-[#0a0a0a] hover:!bg-white/5 !rounded-xl !h-12 !border !transition-all',
    socialButtonsBlockButtonText: '!text-white !text-sm !font-medium',
    socialButtonsIconButton: '!border-white/10 !bg-[#0a0a0a] hover:!bg-white/5 !rounded-xl !border !transition-all',
    dividerLine: '!bg-white/10',
    dividerText: '!text-[#d4d4d4]/50 !text-xs',
    footerActionLink: '!text-[#c5a059] hover:!text-[#d4b06a] !font-medium !text-sm !transition-colors',
    footerAction: '!mt-4',
    formFieldActionRow: '!justify-between !items-center',
    otpCodeFieldInput: '!bg-[#0a0a0a] !border !border-white/10 !text-white !rounded-xl !h-12 !text-center !text-lg focus:!border-[#c5a059] focus:!ring-1 focus:!ring-[#c5a059]/30 !transition-all',
    identityPreview: '!bg-[#0a0a0a] !border-white/10 !rounded-xl',
    identityPreviewEdit: '!text-[#c5a059]',
  },
};

interface AuthPageProps {
  mode?: 'sign-in' | 'sign-up';
}

export default function AuthPage({ mode = 'sign-in' }: AuthPageProps) {
  const navigate = useNavigate();
  const isSignUp = mode === 'sign-up';

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-20">
      {/* Back to home */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-20 left-6 z-40 flex items-center gap-2 font-sans text-xs text-[#d4d4d4]/70 hover:text-[#c5a059] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Brand */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#121212] border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
          <Waves className="w-5 h-5" />
        </div>
        <span className="font-serif font-semibold text-xl text-white tracking-wider">
          BuildPass
        </span>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-white mb-2">
          {isSignUp ? 'Create Your Account' : 'Welcome Back'}
        </h1>
        <p className="text-sm text-[#d4d4d4]/60 max-w-xs mx-auto">
          {isSignUp
            ? 'Sign up to create and share your HH Goa 2026 builder card.'
            : 'Sign in to access your card generator.'}
        </p>
      </div>

      {/* Clerk Component — hash routing to avoid conflicts with React Router */}
      <div className="w-full max-w-md">
        {isSignUp ? (
          <SignUp
            routing="hash"
            afterSignUpUrl="/create"
            afterSignInUrl="/create"
            appearance={clerkAppearance}
          />
        ) : (
          <SignIn
            routing="hash"
            afterSignInUrl="/create"
            afterSignUpUrl="/sign-up"
            appearance={clerkAppearance}
          />
        )}
      </div>

      {/* Toggle sign in / sign up */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate(isSignUp ? '/sign-in' : '/sign-up')}
          className="text-sm text-[#d4d4d4]/60 hover:text-[#c5a059] transition-colors"
        >
          {isSignUp ? (
            <>Already have an account? <span className="text-[#c5a059] font-semibold">Sign In</span></>
          ) : (
            <>Don't have an account? <span className="text-[#c5a059] font-semibold">Sign Up</span></>
          )}
        </button>
      </div>
    </div>
  );
}
