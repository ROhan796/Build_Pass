import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import CreatePage from './pages/CreatePage';
import ResultPage from './pages/ResultPage';
import SharePage from './pages/SharePage';
import AdminPage from './pages/AdminPage';
import ErrorBoundary from './components/ErrorBoundary';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[#d4d4d4]/70 font-mono">Loading...</span>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#060A12] text-[#F0F4FF] flex flex-col font-sans">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060A12] text-[#F0F4FF] flex flex-col font-sans selection:bg-[#00FFC2] selection:text-[#060A12]">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/share/:id" element={<SharePage />} />

          {/* Auth pages — sign-in and sign-up with dedicated Clerk paths */}
          <Route path="/sign-in" element={
            <>
              <SignedIn>
                <Navigate to="/create" replace />
              </SignedIn>
              <SignedOut>
                <AuthPage mode="sign-in" />
              </SignedOut>
            </>
          } />
          <Route path="/sign-up" element={
            <>
              <SignedIn>
                <Navigate to="/create" replace />
              </SignedIn>
              <SignedOut>
                <AuthPage mode="sign-up" />
              </SignedOut>
            </>
          } />
          <Route path="/auth" element={<Navigate to="/sign-in" replace />} />

          {/* Protected: Create page — requires sign-in */}
          <Route path="/create" element={
            <>
              <SignedIn>
                <CreatePage />
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          } />

          {/* Protected: Admin page — requires sign-in */}
          <Route path="/admin" element={
            <>
              <SignedIn>
                <AdminPage isAuthenticated={true} onAuthenticate={() => {}} />
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function InnerApp() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      {CLERK_PUBLISHABLE_KEY ? (
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
          <InnerApp />
        </ClerkProvider>
      ) : (
        <InnerApp />
      )}
    </ErrorBoundary>
  );
}
