import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: '홈' },
  { to: '/politician', label: '정치인' },
  { to: '/policy', label: '정책비교' },
  { to: '/news', label: '뉴스요약' },
  { to: '/chat', label: '챗봇' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">정CHPT</Link>
      <div className="navbar-links">
        {links.map(l => (
          <Link key={l.to} to={l.to} className={`nav-link${pathname === l.to ? ' active' : ''}`}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
