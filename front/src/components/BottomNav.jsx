import { NavLink } from 'react-router-dom';

const tabs = [
  {
    to: '/',
    icon: '🏠',
    label: 'Dashboard',
  },
  {
    to: '/suivi',
    icon: '📊',
    label: 'Suivi',
  },
  {
    to: '/plus',
    icon: '⚙️',
    label: 'Plus',
  },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white border-t border-gray-200 shadow flex justify-between px-2 py-1 sm:px-8">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center flex-1 py-1 transition-colors ${
              isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'
            }`
          }
        >
          <span className="text-2xl mb-0.5">{tab.icon}</span>
          <span className="text-xs">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
} 