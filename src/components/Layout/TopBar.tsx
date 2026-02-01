import { NavLink } from 'react-router-dom';
import './TopBar.css';

const navItems = [
  { path: '/test', label: 'Test' },
  { path: '/train', label: 'Train' },
  { path: '/practice', label: 'Practice' },
  { path: '/history', label: 'History' },
  { path: '/settings', label: 'Settings' },
];

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-logo">Moji</div>
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
