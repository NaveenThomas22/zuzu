import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PixelInput from '../components/PixelInput';
import PixelButton from '../components/PixelButton';
import PixelCard from '../components/PixelCard';
import PixelSparkles from '../components/PixelSparkles';
import PixelDoodle from '../components/PixelDoodle';
import PixelDecoration from '../components/PixelDecoration';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'male' // Male / Female toggle
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        gender: formData.gender.toUpperCase(),
      });
      navigate('/login');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join(', '));
      } else {
        setError(typeof detail === 'string' ? detail : "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative max-w-sm mx-auto min-h-screen bg-soft-pink flex flex-col items-center justify-center p-6 py-12 z-10 overflow-hidden">
      <PixelSparkles />

      {/* Cloud decorations */}
      <div className="absolute top-8 right-4 opacity-80"><PixelDoodle type="cloud" size={48} /></div>
      <div className="absolute top-16 left-4 opacity-80"><PixelDoodle type="cloud" size={32} /></div>

      <div className="relative flex flex-col items-center mb-6 z-10">
        <h1 className="font-pixel text-4xl text-ink mb-2 drop-shadow-pixel text-center">CREATE ACCOUNT</h1>
        <p className="font-retro text-lg text-ink">Join the club</p>
      </div>

      <PixelCard className="w-full z-10 relative">
        {/* Washi tape */}
        <div className="absolute -top-3 -right-3 w-12 h-4 bg-yellow-pp border-2 border-ink rotate-12 z-20 shadow-pixel-sm"></div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <h2 className="font-pixel text-sm text-ink mb-1">Welcome!</h2>
            <p className="font-retro text-sm text-ink">Create your account below.</p>
          </div>

          {error && <div className="border-[3px] border-ink bg-pink-pp p-2 text-center shadow-pixel-sm"><span className="font-retro text-ink text-sm">{error}</span></div>}

          <PixelInput
            label="NAME"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <PixelInput
            label="EMAIL"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="flex border-[3px] border-ink shadow-pixel-sm p-1 bg-cream mt-1">
            <button
              type="button"
              className={`flex-1 font-pixel text-[10px] py-2 uppercase border-[3px] border-transparent ${formData.gender === 'male' ? 'bg-cyan-light border-ink shadow-pixel-sm' : 'bg-transparent text-ink/70'}`}
              onClick={() => setFormData({ ...formData, gender: 'male' })}
            >
              Male
            </button>
            <button
              type="button"
              className={`flex-1 font-pixel text-[10px] py-2 uppercase border-[3px] border-transparent ${formData.gender === 'female' ? 'bg-pink-pp border-ink shadow-pixel-sm' : 'bg-transparent text-ink/70'}`}
              onClick={() => setFormData({ ...formData, gender: 'female' })}
            >
              Female
            </button>
          </div>

          <PixelInput
            label="PASSWORD"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <PixelInput
            label="CONFIRM PASSWORD"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <PixelButton variant="pink" type="submit" disabled={loading} className="mt-4 text-lg">
            {loading ? 'WAIT...' : 'Create Account'}
          </PixelButton>
        </form>
      </PixelCard>

      <Link to="/login" className="relative mt-8 font-retro text-base text-ink z-10">
        Already have an account? <span className="font-pixel text-[10px] text-pink-pp ml-1 drop-shadow-[1px_1px_0_#1A1A1A] hover:text-yellow-pp transition-colors">SIGN IN</span>
      </Link>

      <PixelDecoration />
    </main>
  );
};

export default RegisterPage;
