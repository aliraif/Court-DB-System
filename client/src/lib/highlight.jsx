export const highlightStyle = {
  background: '#fce94f',
  color: '#1a1a1a',
  borderRadius: 2,
  padding: '0 1px',
};

export function highlight(text, term) {
  if (!term) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={i} style={highlightStyle}>{part}</mark>
    ) : (
      part
    )
  );
}
