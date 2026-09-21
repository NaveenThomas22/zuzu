import React from 'react';
import { NavLink } from 'react-router-dom';
import PixelIcon from './PixelIcon';
import PixelDoodle from './PixelDoodle';

const TABS = [
  { to: "/", icon: "home", label: "Home" },
  { to: "/add", icon: "add", label: "Add" },
  { to: "/reports", icon: "reports", label: "Reports" },
  { to: "/lending", icon: "lending", label: "Lending" },
  { to: "/profile", icon: "profile", label: "Profile" },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-cream border-t-[3px] border-ink flex z-50">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `relative flex-1 flex flex-col items-center justify-center py-2 gap-1 border-r-[3px] border-ink last:border-r-0 transition-colors ${
              isActive ? 'bg-pink-pp border-t-[3px] border-t-ink -mt-[3px]' : 'bg-cream hover:bg-cyan-light'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute -top-6 animate-bounce-pixel">
                  <PixelDoodle type="heart" size={16} />
                </div>
              )}
              <PixelIcon name={tab.icon} size={28} accent={isActive ? "#1A1A1A" : "#CE93D8"} />
              <span className="font-pixel text-[9px] text-ink uppercase tracking-wider">{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
