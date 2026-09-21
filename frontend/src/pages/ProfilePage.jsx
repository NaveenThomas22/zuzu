import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PixelIcon from '../components/PixelIcon';
import PixelCard from '../components/PixelCard';
import PixelButton from '../components/PixelButton';
import BottomNav from '../components/BottomNav';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.name || 'Friend';
  const displayEmail = user?.email || '';

  return (
    <main className="max-w-md mx-auto min-h-screen bg-cream pb-32">
      <div className="flex items-center justify-between p-4 bg-lavender border-b-[3px] border-ink shadow-pixel-sm sticky top-0 z-10">
        <h1 className="font-pixel text-base text-ink uppercase">Zuzu Control</h1>
        <PixelIcon name="profile" size={24} />
      </div>

      <div className="p-4 flex flex-col gap-6 mt-2">
        
        {/* Avatar + Identity */}
        <PixelCard tilt="right" className="flex items-center gap-4 bg-yellow-pp/10">
          <img 
            src="/assets/pixel-character.png" 
            alt="Zuzu Avatar" 
            className="w-16 h-16 border-[3px] border-ink bg-cyan-light shadow-pixel-sm object-cover" 
            style={{ imageRendering: 'pixelated' }} 
          />
          <div className="flex flex-col truncate">
            <h2 className="font-pixel text-sm text-ink truncate">{displayName}</h2>
            {displayEmail && <span className="font-retro text-xs text-ink/70 truncate">{displayEmail}</span>}
            <p className="font-retro text-[10px] text-ink mt-2 italic">Your personal money companion.</p>
          </div>
        </PixelCard>

        {/* Management Menus */}
        <div className="flex flex-col gap-3">
          <h3 className="font-pixel text-[10px] text-ink uppercase pl-1 border-b-[2px] border-ink/20 pb-1">Management</h3>
          
          <div 
            className="border-[3px] border-ink shadow-pixel-sm bg-cream p-3 flex items-center justify-between cursor-pointer hover:bg-cyan-light transition-colors"
            onClick={() => navigate('/accounts')}
          >
            <div className="flex items-center gap-3">
              <div className="border-[2px] border-ink p-1 bg-cyan-light">
                <PixelIcon name="computer" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-pixel text-sm text-ink uppercase">Accounts</span>
                <span className="font-retro text-[10px] text-ink/70">Manage your money sources</span>
              </div>
            </div>
            <span className="font-pixel text-sm text-ink">&gt;</span>
          </div>

          <div 
            className="border-[3px] border-ink shadow-pixel-sm bg-cream p-3 flex items-center justify-between cursor-pointer hover:bg-mint transition-colors"
            onClick={() => navigate('/bills')}
          >
            <div className="flex items-center gap-3">
              <div className="border-[2px] border-ink p-1 bg-mint">
                <PixelIcon name="bills" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-pixel text-sm text-ink uppercase">Bills</span>
                <span className="font-retro text-[10px] text-ink/70">Track bills and due dates</span>
              </div>
            </div>
            <span className="font-pixel text-sm text-ink">&gt;</span>
          </div>

          <div 
            className="border-[3px] border-ink shadow-pixel-sm bg-cream p-3 flex items-center justify-between cursor-pointer hover:bg-lavender transition-colors"
            onClick={() => navigate('/budgets')}
          >
            <div className="flex items-center gap-3">
              <div className="border-[2px] border-ink p-1 bg-lavender">
                <PixelIcon name="chart" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-pixel text-sm text-ink uppercase">Budgets</span>
                <span className="font-retro text-[10px] text-ink/70">Manage monthly spending</span>
              </div>
            </div>
            <span className="font-pixel text-sm text-ink">&gt;</span>
          </div>

          <div 
            className="border-[3px] border-ink shadow-pixel-sm bg-cream p-3 flex items-center justify-between cursor-pointer hover:bg-yellow-pp/50 transition-colors"
            onClick={() => navigate('/audit-logs')}
          >
            <div className="flex items-center gap-3">
              <div className="border-[2px] border-ink p-1 bg-yellow-pp">
                <PixelIcon name="reports" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-pixel text-sm text-ink uppercase">Audit Logs</span>
                <span className="font-retro text-[10px] text-ink/70">View your activity history</span>
              </div>
            </div>
            <span className="font-pixel text-sm text-ink">&gt;</span>
          </div>
        </div>

        {/* Logout */}
        <PixelButton variant="pink" className="w-full mt-6 text-sm" onClick={handleLogout}>
          LOGOUT
        </PixelButton>

      </div>
      <BottomNav />
    </main>
  );
};

export default ProfilePage;
