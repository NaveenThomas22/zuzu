import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PixelInput from '../components/PixelInput';
import PixelButton from '../components/PixelButton';
import PixelError from '../components/PixelError';
import PixelIcon from '../components/PixelIcon';
import WelcomeOverlay from '../components/WelcomeOverlay';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState(null);

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      setWelcomeUser(user);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join(', '));
      } else {
        setError(typeof detail === 'string' ? detail : "Invalid credentials.");
      }
      setLoading(false);
    }
  };

  const handleWelcomeComplete = () => {
    navigate('/');
  };

  return (
    <main className="relative min-h-screen bg-[#F9F7F1] flex flex-col items-center justify-center p-4 sm:p-6 z-10 overflow-hidden">
      {welcomeUser && <WelcomeOverlay user={welcomeUser} onComplete={handleWelcomeComplete} />}

      {/* Decorative Layer - Extremely Minimal */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        {/* Desktop decorations (2 items) */}
        <div className="hidden sm:block absolute w-full max-w-4xl h-[500px]">
          <div className="absolute top-10 left-12"><PixelIcon name="deco-star-small" size={24} accent="#80DEEA" /></div>
          <div className="absolute bottom-12 right-16"><PixelIcon name="deco-sparkle-1" size={24} accent="#F48FB1" /></div>
        </div>
        {/* Mobile decorations (1 item) */}
        <div className="sm:hidden absolute w-full h-full max-w-md">
          <div className="absolute top-16 right-6"><PixelIcon name="deco-star-small" size={24} accent="#FFD54F" /></div>
        </div>
      </div>

      {/* Retro OS Application Window */}
      <div className="relative w-full max-w-[400px] flex flex-col border-[3px] border-ink shadow-pixel z-10 bg-cream">

        {/* Window Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#E2E0D8] border-b-[3px] border-ink shrink-0">
          <span className="font-pixel text-[10px] text-ink uppercase tracking-wider">ZUZU.EXE</span>
          <div className="flex gap-1.5">
            {/* Minimize */}
            <div className="w-3.5 h-3.5 border-[2px] border-ink bg-cream flex items-end justify-center pb-0.5">
              <div className="w-1.5 h-[2px] bg-ink"></div>
            </div>
            {/* Maximize */}
            <div className="w-3.5 h-3.5 border-[2px] border-ink bg-cream flex items-center justify-center">
              <div className="w-1.5 h-1.5 border-[2px] border-ink"></div>
            </div>
            {/* Close */}
            <div className="w-3.5 h-3.5 border-[2px] border-ink bg-cream flex items-center justify-center relative">
              <div className="w-2 h-[2px] bg-ink rotate-45 absolute"></div>
              <div className="w-2 h-[2px] bg-ink -rotate-45 absolute"></div>
            </div>
          </div>
        </div>

        {/* Window Body */}
        <div className="p-6 sm:p-8 flex flex-col bg-[#F9F7F1]">

          {/* Logo & Subtitle */}
          <div className="flex flex-col items-center mb-8">
            <h1 className="font-pixel text-4xl text-ink tracking-tight mb-2">ZUZU</h1>
            <p className="font-retro text-[10px] text-ink/70 uppercase tracking-[0.2em]">Make Every Rupee Count</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {error && <PixelError message={error} onRetry={() => setError(null)} />}

            <PixelInput
              label="EMAIL"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />

            <div className="relative">
              <PixelInput
                label="PASSWORD"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-ink/50 hover:text-ink transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <PixelIcon name="sun" size={20} />
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center mt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="w-3 h-3 border-[2px] border-ink bg-cream flex items-center justify-center shrink-0"></div>
                <span className="font-retro text-[11px] text-ink group-hover:underline">Remember me</span>
              </label>
              <a href="#" className="font-retro text-[11px] text-ink hover:underline">Forgot password?</a>
            </div>

            <PixelButton variant="pink" type="submit" disabled={loading} className="mt-4 text-base w-full">
              {loading ? 'WAIT...' : 'SIGN IN →'}
            </PixelButton>
          </form>

          <div className="mt-8 text-center pt-6 border-t-[2px] border-ink/10">
            <Link to="/register" className="font-retro text-[11px] text-ink hover:underline">
              Don't have an account? <span className="font-pixel text-[9px] ml-1">SIGN UP</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
