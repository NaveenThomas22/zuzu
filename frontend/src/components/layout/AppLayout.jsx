import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

/**
 * AppLayout — Main layout wrapper with bottom navigation.
 * Provides centered mobile shell on larger screens.
 */
export default function AppLayout() {
  return (
    <div className="app-shell bg-cream min-h-dvh">
      {/* Main scrollable content */}
      <main className="pb-nav-safe">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <BottomNavigation />
    </div>
  );
}
