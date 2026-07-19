import { Link } from 'react-router-dom';
import { Lock, Landmark } from 'lucide-react';
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
      <button style={styles.lockBtn} onClick={handleLock} title="Lock">
        <Lock size={16} />
      </button>
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
  lockBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    width: 34,
    height: 34,
  },
};
