import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={styles.wrap}>
      <h1 className="heading" style={styles.code}>404</h1>
      <p style={styles.text}>Page not found.</p>
      <Link to="/home" style={styles.link}>Back to search</Link>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  code: {
    fontSize: 64,
    color: 'var(--accent)',
  },
  text: {
    color: 'var(--muted)',
    marginBottom: 12,
  },
  link: {
    color: 'var(--accent)',
    fontSize: 14,
    textDecoration: 'none',
  },
};
