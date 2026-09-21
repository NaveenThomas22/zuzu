import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PixelInput from '../components/PixelInput';
import PixelButton from '../components/PixelButton';
import PixelCard from '../components/PixelCard';
import PixelError from '../components/PixelError';
import PixelIcon from '../components/PixelIcon';
import PixelSparkles from '../components/PixelSparkles';
import PixelDoodle from '../components/PixelDoodle';
import PixelDecoration from '../components/PixelDecoration';
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
    <main className="relative max-w-sm mx-auto min-h-screen bg-soft-pink flex flex-col items-center justify-center p-6 z-10 overflow-hidden">
      {welcomeUser && <WelcomeOverlay user={welcomeUser} onComplete={handleWelcomeComplete} />}
      <PixelSparkles />
      
      {/* Cloud decorations */}
      <div className="absolute top-8 left-4 opacity-80"><PixelDoodle type="cloud" size={48} /></div>
      <div className="absolute top-16 right-4 opacity-80"><PixelDoodle type="cloud" size={32} /></div>

      <div className="relative flex flex-col items-center mb-8 z-10">
        <h1 className="font-pixel text-4xl text-ink mb-4 drop-shadow-pixel">ZUZU</h1>
        <div className="relative mb-4">
          <PixelDoodle type="computer-smiley" size={96} />
          <div className="absolute -top-2 -right-4"><PixelDoodle type="sparkle" size={24} /></div>
          <div className="absolute bottom-0 -left-6"><PixelDoodle type="star" size={20} /></div>
        </div>
        <p className="font-retro text-lg text-ink">Your money, your story</p>
      </div>

      <PixelCard tilt="right" className="w-full z-10 relative">
        {/* Washi tape */}
        <div className="absolute -top-3 -left-3 w-12 h-4 bg-pink-pp border-2 border-ink -rotate-12 z-20 shadow-pixel-sm"></div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <h2 className="font-pixel text-xs text-ink mb-1 uppercase tracking-tight">Welcome Back!</h2>
            <p className="font-retro text-sm text-ink">Sign in to continue your journey.</p>
          </div>

          {error && <div className="border-[3px] border-ink bg-pink-pp p-2 text-center shadow-pixel-sm"><span className="font-retro text-ink text-sm">{error}</span></div>}

          <PixelInput 
            label="EMAIL" 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required 
          />
          
          <div className="relative">
            <PixelInput 
              label="PASSWORD" 
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
            <button 
              type="button" 
              className="absolute right-3 top-9"
              onClick={() => setShowPassword(!showPassword)}
            >
              <PixelIcon name="sun" size={20} /> {/* Reusing an icon for 'eye' visually */}
            </button>
          </div>

              <PixelButton variant="pink" type="submit" disabled={loading} className="mt-2 text-lg">
            {loading ? 'WAIT...' : 'Sign In'}
          </PixelButton>
        </form>
      </PixelCard>

      <Link to="/register" className="relative mt-8 font-retro text-base text-ink z-10">
        Don't have an account? <span className="font-pixel text-[10px] text-pink-pp ml-1 drop-shadow-[1px_1px_0_#1A1A1A] hover:text-yellow-pp transition-colors">SIGN UP</span>
      </Link>

      <PixelDecoration />
    </main>
  );
};

export default LoginPage;
