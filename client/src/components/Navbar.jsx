import { Link } from 'react-router-dom';
import { Lock, Landmark, ShieldUser, FileText } from 'lucide-react';
import { lock } from './PasswordGate';

export default function Navbar() {
  const handleLock = () => {
    lock();
    window.location.reload();
  };

  return (
    <nav style={styles.nav}>
      <Link to="/home" style={styles.brand}>
        <Landmark size={18} color="var(--accent)" />
        <span className="heading" style={styles.brandText}>Kedah Court System</span>
      </Link>
      <div style={styles.actions}>
        <Link to="/cases" style={styles.iconBtn} title="Cases">
          <FileText size={16} />
        </Link>
        <Link to="/admin" style={styles.iconBtn} title="Admin">
          <ShieldUser size={16} />
        </Link>
        <button style={styles.iconBtn} onClick={handleLock} title="Lock">
          <Lock size={16} />
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--card)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
  },
  brandText: {
    fontSize: 20,
    color: 'var(--text)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    width: 34,
    height: 34,
    textDecoration: 'none',
  },
};
