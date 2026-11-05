import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { loginWithEmail, loginWithGoogle, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate(redirectPath);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate(redirectPath);
    } catch (err) {
      setErrorMessage(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    try {
      await loginWithEmail('editorial.analyst@crossview.news', 'Password123!');
      navigate(redirectPath);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F7F7F5]">
      {/* Left Column: Visual Editorial Side (Desktop) */}
      <div className="hidden lg:relative lg:flex flex-col justify-between p-12 bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop"
            alt="Newspaper press"
            className="w-full h-full object-cover opacity-20 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy/90 to-transparent" />
        </div>

        {/* Top Branding */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="font-editorial text-2xl font-bold tracking-tight block">
                CrossView
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-300">
                News Intelligence Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Middle Editorial Quote */}
        <div className="relative z-10 max-w-md my-auto">
          <span className="text-xs uppercase tracking-widest text-amber-300 font-bold block mb-2">
            The Multi-Source Promise
          </span>
          <h2 className="font-editorial text-3xl font-bold leading-snug mb-4">
            "See Every Side. Understand Every Story."
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            News reporting is never monochrome. Access consolidated reporting, corroborated evidence, and analytical timelines verified across independent global newsrooms.
          </p>

          <div className="mt-8 space-y-3 pt-6 border-t border-white/15 text-xs text-gray-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-Source Article Clustering</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sentence Transformers & Cosine Similarity</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Grounding With Publisher Citations</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-gray-400">
          © {new Date().getFullYear()} CrossView Intelligence Console.
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          {/* Header */}
          <div>
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-md bg-navy flex items-center justify-center text-white">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="font-editorial text-xl font-bold text-primary">CrossView</span>
            </div>

            <h1 className="font-editorial text-3xl font-bold text-primary tracking-tight">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-secondary">
              Sign in to access your multi-source intelligence console, saved reports, and live event timelines.
            </p>
          </div>

          {/* Development / Demo Mode Notice */}
          {!isFirebaseConfigured && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Development Mode Active:</span>
                Firebase API keys are currently unconfigured in .env. You can sign in using any credentials or click below for instant access.
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="mt-2 block font-bold text-navy hover:underline"
                >
                  → Click here to sign in with instant Demo Analyst session
                </button>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="analyst@crossview.news"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-border rounded-md focus:outline-none focus:border-navy text-primary placeholder-secondary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-primary uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-navy hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-border rounded-md focus:outline-none focus:border-navy text-primary placeholder-secondary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-navy hover:bg-navy-dark rounded-md transition-all shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-[#F7F7F5] px-3 text-xs uppercase tracking-wider text-secondary font-semibold">
              OR
            </span>
            <div className="border-t border-border w-full" />
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 text-sm font-semibold text-primary bg-white hover:bg-gray-50 border border-border rounded-md transition-all shadow-xs disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Registration Link */}
          <div className="text-center text-xs text-secondary">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-navy hover:underline">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
