import { NavLink } from 'react-router-dom';
import './TopBar.css';

const navItems = [
  { path: '/test', label: 'Test' },
  { path: '/train', label: 'Train' },
  { path: '/practice', label: 'Practice' },
  { path: '/history', label: 'History' },
  { path: '/settings', label: 'Settings' },
];

function MojiLogo() {
  return (
    <svg
      className="topbar-logo-icon"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Moji logo"
    >
      {/* Key body */}
      <rect x="2" y="4" width="28" height="24" rx="5" ry="5"
        fill="#0C1220" stroke="rgba(77,180,255,0.35)" strokeWidth="1.5" />

      {/* Inner key face (raised) */}
      <rect x="4" y="6" width="24" height="18" rx="3.5" ry="3.5"
        fill="#101A2E" />

      {/* Enter arrow: horizontal arm */}
      <rect x="8" y="15" width="10" height="2.5" rx="1.25"
        fill="#4DB4FF" />

      {/* Enter arrow: vertical arm (down stroke) */}
      <rect x="17.5" y="10" width="2.5" height="7.5" rx="1.25"
        fill="#4DB4FF" />

      {/* Arrow head (pointing left) */}
      <polygon points="8,16.25 11.5,13 11.5,19.5"
        fill="#4DB4FF" />

      {/* Glow effect */}
      <rect x="4" y="6" width="24" height="18" rx="3.5" ry="3.5"
        fill="url(#glow)" opacity="0.15" />

      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4DB4FF" />
          <stop offset="100%" stopColor="#4DB4FF" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <NavLink to="/test" className="topbar-logo" aria-label="Moji Home">
          <MojiLogo />
          <span className="topbar-logo-text">Moji</span>
        </NavLink>
        <nav className="topbar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `topbar-tab ${isActive ? 'topbar-tab--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
