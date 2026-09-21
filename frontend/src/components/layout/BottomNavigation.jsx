import { NavLink, useLocation } from 'react-router-dom';
import { PixelHome, PixelAdd, PixelChart, PixelHandshake, PixelUser } from '../pixel/PixelIcons';

const navItems = [
  { path: '/', label: 'Home', Icon: PixelHome },
  { path: '/add', label: 'Add', Icon: PixelAdd },
  { path: '/reports', label: 'Reports', Icon: PixelChart },
  { path: '/lending', label: 'Lending', Icon: PixelHandshake },
  { path: '/profile', label: 'Profile', Icon: PixelUser },
];

/**
 * BottomNavigation — Fixed retro handheld-style bottom nav bar.
 */
export default function BottomNavigation() {
  const location = useLocation();

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0
        z-40
        bg-cream-light
        border-t-[4px] border-border-black
      "
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Main navigation"
    >
      <div className="max-w-[480px] mx-auto flex items-stretch h-[68px]">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex-1
                flex flex-col items-center justify-center
                relative
                transition-all duration-100
                ${index !== navItems.length - 1 ? 'border-r-[3px] border-border-black' : ''}
                ${isActive
                  ? 'bg-retro-pink-bg'
                  : 'bg-transparent hover:bg-cream-dark'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-0 right-0 h-[3px] bg-retro-pink" />
              )}

              {/* Icon */}
              <span className={`
                ${isActive ? 'text-near-black' : 'text-medium-gray'}
              `}>
                <item.Icon size={26} />
              </span>

              {/* Label */}
              <span className={`
                font-[family-name:var(--font-pixel)] text-[7px]
                mt-1
                ${isActive ? 'text-near-black' : 'text-medium-gray'}
              `}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
