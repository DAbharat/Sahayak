import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { UserAuth } from '../types.ts';
import { AshokaEmblem } from './Emblems.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (authData: UserAuth) => void;
  onAuthenticate: (
    mode: 'login' | 'signup',
    credentials: { email: string; password: string }
  ) => Promise<UserAuth>;
  onQuickLogin: (role: 'farmer' | 'vendor' | 'artisan') => Promise<UserAuth>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onAuthenticate,
  onQuickLogin
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('farmer@sahayak.gov.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateInputs = (): string | null => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return 'ईमेल पता दर्ज करें / Please enter an email address.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return 'अमान्य ईमेल प्रारूप / Invalid email address format.';
    }
    if (!password) {
      return 'पासवर्ड दर्ज करें / Please enter a password.';
    }
    if (password.length < 8 || password.length > 72) {
      return 'पासवर्ड 8 से 72 अक्षरों के बीच होना चाहिए / Password must be between 8 and 72 characters.';
    }
    return null;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const validation = validateInputs();
    if (validation) {
      setErrorMsg(validation);
      return;
    }

    setLoading(true);

    try {
      const authData = await onAuthenticate(mode, { email: email.trim(), password });
      if (mode === 'signup') {
        setSuccessMsg('पंजीकरण सफल! लॉग इन हो रहा है...');
      }

      if (mode === 'signup') {
        setTimeout(() => {
          onLoginSuccess(authData);
          onClose();
        }, 600);
      } else {
        onLoginSuccess(authData);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'प्रमाणीकरण विफल रहा। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'farmer' | 'vendor' | 'artisan') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const demoEmail = {
      farmer: 'farmer@sahayak.gov.in',
      vendor: 'vendor@sahayak.gov.in',
      artisan: 'artisan@sahayak.gov.in'
    }[role];
    setEmail(demoEmail);
    setPassword('password123');

    try {
      const authData = await onQuickLogin(role);
      onLoginSuccess(authData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div id="auth-modal-container" className="bg-white rounded-2xl border-2 border-orange-200 max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
        {/* Modal Header */}
        <div className="bg-[#F77F00] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AshokaEmblem size={28} className="brightness-200" />
            <div>
              <h3 className="font-bold text-base leading-tight">
                {mode === 'login' ? 'नागरिक प्रवेश / Citizen Sign In' : 'नया पंजीकरण / New Registration'}
              </h3>
              <p className="text-[11px] text-orange-100">
                Go Backend API Authentication & Single Sign-On
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Mode Switch Tabs */}
          <div className="flex border-b border-gray-200 text-sm font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 pb-2.5 text-center border-b-2 transition-colors ${
                mode === 'login' ? 'border-[#F77F00] text-[#F77F00]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              लॉग इन / Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 pb-2.5 text-center border-b-2 transition-colors ${
                mode === 'signup' ? 'border-[#F77F00] text-[#F77F00]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              पंजीकरण / Register
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                ईमेल पता / Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#F77F00] focus:ring-1 focus:ring-[#F77F00] outline-none"
                />
              </div>
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                Official registration requires a standard valid email format.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                पासवर्ड / Password (8–72 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  maxLength={72}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#F77F00] focus:ring-1 focus:ring-[#F77F00] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
                <span>Min: 8 characters</span>
                <span className={password.length >= 8 && password.length <= 72 ? 'text-green-600 font-bold' : 'text-gray-400'}>
                  {password.length} / 72 chars
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="auth-submit-btn"
              className="w-full py-2.5 rounded-lg bg-[#006400] text-white text-sm font-bold hover:bg-[#004d00] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Processing...'
                  : mode === 'signup'
                  ? 'Create Account / खाता बनाएं'
                  : 'Sign In / प्रवेश करें'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Test Profiles for Evaluation */}
          <div className="pt-3 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-700 block mb-2 flex items-center gap-1.5">
              <span>⚡</span>
              <span>1-Click Test Accounts (Pre-configured in Backend):</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('farmer')}
                className="p-2 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 text-left text-xs font-bold text-green-950 transition-all hover:shadow-xs"
              >
                🌾 Small Farmer
                <span className="block text-[10px] font-medium text-green-800">Maharashtra</span>
                <span className="block text-[9px] text-gray-500 truncate">farmer@sahayak</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('vendor')}
                className="p-2 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-left text-xs font-bold text-orange-950 transition-all hover:shadow-xs"
              >
                🛒 Street Vendor
                <span className="block text-[10px] font-medium text-orange-800">Haryana</span>
                <span className="block text-[9px] text-gray-500 truncate">vendor@sahayak</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('artisan')}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left text-xs font-bold text-blue-950 transition-all hover:shadow-xs"
              >
                🧵 Artisan
                <span className="block text-[10px] font-medium text-blue-800">Rajasthan</span>
                <span className="block text-[9px] text-gray-500 truncate">artisan@sahayak</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#006400]" />
            <span>JWT Bearer 15-min Access / 7-day Refresh Token</span>
          </div>
          <span className="text-[10px] font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">Go API</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
