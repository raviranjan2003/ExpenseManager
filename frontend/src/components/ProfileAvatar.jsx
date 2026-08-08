const COLORS = [
  'bg-brand-600',
  'bg-indigo-600',
  'bg-violet-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-emerald-600',
  'bg-sky-600',
];

function hashName(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = name.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h);
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function ProfileAvatar({ name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base',
  };
  const color = COLORS[hashName(name) % COLORS.length];

  return (
    <div
      className={[
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm',
        sizes[size] || sizes.md,
        color,
        className,
      ].join(' ')}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
