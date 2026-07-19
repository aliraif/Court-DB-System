import { useState } from 'react';

const GATE_KEY = 'kcs_unlocked';
const PASSWORD = '6767';

// eslint-disable-next-line react-refresh/only-export-components
export function isUnlocked() {
  return sessionStorage.getItem(GATE_KEY) === 'true';
}

// eslint-disable-next-line react-refresh/only-export-components
export function lock() {
  sessionStorage.removeItem(GATE_KEY);
}

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(isUnlocked());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === PASSWORD) {
      sessionStorage.setItem(GATE_KEY, 'true');
      setUnlocked(true);
    } else {
      setError('Incorrect password.');
      setPassword('');
    }
  };

  if (unlocked) return children;

  return (
    <div style={styles.wrap}>
      <div className="card page-enter" style={styles.card}>
        <h1 className="heading" style={styles.title}>Kedah Court System</h1>
        <p style={styles.subtitle}>Enter password to continue.</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: 16 }}
            autoFocus
          />
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 6,
  },
  subtitle: {
    color: 'var(--muted)',
    fontSize: 14,
    marginBottom: 24,
  },
  errorBox: {
    background: 'rgba(224,62,26,0.1)',
    border: '1px solid rgba(224,62,26,0.25)',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 16,
    color: 'var(--red)',
    fontSize: 13,
  },
};
