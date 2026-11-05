import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { resetPassword } = useAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email) {
      setErrorMessage('Please enter your account email.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F7F7F5]">
      <div className="max-w-md w-full bg-white p-8 rounded-lg border border-border shadow-card space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-md bg-navy flex items-center justify-center text-white">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-editorial text-2xl font-bold text-primary">CrossView</span>
          </Link>
          <h1 className="font-editorial text-2xl font-bold text-primary tracking-tight">
            Reset Password
          </h1>
          <p className="mt-1 text-xs text-secondary">
            Enter your email and we'll send you instructions to reset your password.
          </p>
        </div>

        {success ? (
          <div className="p-4 rounded-md bg-green-50 border border-green-200 text-xs text-emerald-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Reset Email Sent</span>
            </div>
            <p>
              If an account matches <span className="font-semibold">{email}</span>, a reset link has been dispatched.
            </p>
            <div className="pt-2">
              <Link to="/login" className="font-bold text-navy hover:underline">
                Return to Login →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                Account Email
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-navy hover:bg-navy-dark rounded-md transition-all shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Sending Request...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 text-xs">
              <Link to="/login" className="text-secondary hover:text-primary">
                Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
