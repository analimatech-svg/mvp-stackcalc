import { getTypeColor } from '../utils/typeColors';

interface TypeBadgeProps {
  type: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const TYPE_ICONS: Record<string, string> = {
  normal: '⬤', fire: '🔥', water: '💧', electric: '⚡', grass: '🌿',
  ice: '❄️', fighting: '👊', poison: '☠️', ground: '🌍', flying: '🌬️',
  psychic: '🔮', bug: '🐛', rock: '🪨', ghost: '👻', dragon: '🐉',
  dark: '🌑', steel: '⚙️', fairy: '✨',
};

export default function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const color = getTypeColor(type);

  const sizeClasses: Record<string, string> = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold capitalize tracking-wide ${sizeClasses[size]}`}
      style={{ backgroundColor: color.bg + '33', color: color.bg, border: `1px solid ${color.bg}55` }}
    >
      {size !== 'xs' && <span className="text-[10px] leading-none">{TYPE_ICONS[type] ?? '◆'}</span>}
      {type}
    </span>
  );
}
