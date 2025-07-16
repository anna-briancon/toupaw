import { NavLink, useLocation } from 'react-router-dom';
import { Home, BarChart, Settings } from 'lucide-react';

const tabs = [
  {
    to: '/',
    icon: <Home size={24} />, // Icône Home Lucide
    label: 'Dashboard',
  },
  {
    to: '/suivi',
    icon: <BarChart size={24} />, // Icône BarChart Lucide
    label: 'Suivi',
  },
  {
    to: '/plus',
    icon: <Settings size={24} />, // Icône Settings Lucide
    label: 'Plus',
  },
];

export default function BottomNav() {
  const location = useLocation();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white border-t-2 border-emerald-100 rounded-t-2xl shadow-sm flex justify-between px-6 py-2 sm:px-12 transition-all"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)',
        minHeight: '76px',
      }}
    >
      {tabs.map((tab) => {
        // Custom active logic: /plus and all /multi-pets (and future /plus/*)
        const isActive =
          tab.to === '/plus'
            ? location.pathname.startsWith('/plus') || location.pathname.startsWith('/multi-pets') || location.pathname.startsWith('/edit-pet')
            : location.pathname === tab.to;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={
              isActive
                ? 'flex flex-col items-center flex-1 py-1 transition-colors duration-200 text-emerald-600 font-semibold'
                : 'flex flex-col items-center flex-1 py-1 transition-colors duration-200 text-gray-400'
            }
          >
            <span className="mb-0.5">{tab.icon}</span>
            <span className="text-xs mt-0.5">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
} 