import React, { useState, useEffect, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

const IGNORED_ERRORS = [
  'MetaMask',
  'metamask',
  'wallet',
  'chrome-extension',
  'moz-extension',
  'Failed to connect',
  'user rejected',
  'User rejected',
  'Request rejected',
  'Overlay',
  'TimeoutError',
];

function isIgnorableError(message: string): boolean {
  return IGNORED_ERRORS.some((term) => message.toLowerCase().includes(term.toLowerCase()));
}

function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const msg = event.error?.message || event.message || '';
      if (isIgnorableError(msg)) return;
      // Only catch errors from our app, not from extensions
      const filename = event.filename || '';
      if (filename.includes('chrome-extension') || filename.includes('moz-extension')) return;
      setError(event.error || new Error(msg));
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason || '');
      if (isIgnorableError(reason)) return;
      setError(new Error(reason));
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleRejection, true);
    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleRejection, true);
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-500/50 flex items-center justify-center text-red-400 mb-6 text-2xl">
          !
        </div>
        <h1 className="text-2xl font-serif font-semibold text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-[#d4d4d4]/70 mb-6 max-w-md">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={() => {
            setError(null);
            window.location.reload();
          }}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#c5a059] to-[#8e723d] text-[#0a0a0a] font-semibold text-sm"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

export default ErrorBoundary;
