import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, User, PieChart, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
    backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.9rem',
    transition: 'all 0.15s ease',
    borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
  });

  return (
    <div style={{ 
      width: '250px', 
      backgroundColor: 'var(--sidebar-bg)', 
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      position: 'sticky',
      top: 0,
      height: '100vh'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem', padding: '0.25rem 0.5rem' }}>
        <div style={{ 
          padding: '0.5rem', 
          background: 'linear-gradient(135deg, var(--accent), #c55f2b)', 
          borderRadius: '10px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Target size={22} color="white" strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
          Tasker
        </span>
      </div>

      {/* Navigation Label */}
      <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(169, 199, 193, 0.5)', padding: '0 0.5rem', marginBottom: '0.75rem' }}>
        Menu
      </p>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        <NavLink to="/" style={navLinkStyle} end>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>
        <NavLink to="/projects" style={navLinkStyle}>
          <FolderKanban size={18} />
          Projects
        </NavLink>
        <NavLink to="/analytics" style={navLinkStyle}>
          <PieChart size={18} />
          Analytics
        </NavLink>
      </nav>

      {/* User section */}
      <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '8px', 
            background: 'linear-gradient(135deg, var(--primary), #18897f)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 700, color: '#fff'
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--sidebar-text)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.7rem', width: '100%', 
            padding: '0.7rem 1rem', borderRadius: '8px', color: 'var(--sidebar-text)',
            backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
            fontWeight: 500, fontSize: '0.85rem', transition: 'all 0.15s'
          }}
          onMouseOver={e => { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.backgroundColor = 'rgba(214,69,69,0.12)'; }}
          onMouseOut={e => { e.currentTarget.style.color = 'var(--sidebar-text)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
