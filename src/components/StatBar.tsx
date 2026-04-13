import { useEffect, useState } from 'react';

const STAT_LABELS: Record<string, string> = {
  'hp': 'HP',
  'attack': 'ATK',
  'defense': 'DEF',
  'special-attack': 'SpA',
  'special-defense': 'SpD',
  'speed': 'SPD',
};

const STAT_COLORS: Record<string, string> = {
  'hp': '#FF5959',
  'attack': '#F5AC78',
  'defense': '#FAE078',
  'special-attack': '#9DB7F5',
  'special-defense': '#A7DB8D',
  'speed': '#FA92B2',
};

interface StatBarProps {
  stat: string;
  value: number;
  max?: number;
  animate?: boolean;
}

export default function StatBar({ stat, value, max = 255, animate = true }: StatBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!animate) {
      setWidth((value / max) * 100);
      return;
    }
    const timer = setTimeout(() => setWidth((value / max) * 100), 150);
    return () => clearTimeout(timer);
  }, [value, max, animate]);

  const color = STAT_COLORS[stat] ?? '#94a3b8';
  const label = STAT_LABELS[stat] ?? stat.toUpperCase();
  const pct = Math.round((value / max) * 100);

  const quality =
    pct >= 80 ? 'text-green-400' :
    pct >= 55 ? 'text-yellow-400' :
    pct >= 35 ? 'text-orange-400' :
    'text-red-400';

  return (
    <div className="flex items-center gap-3 group">
      <span className="text-xs font-bold text-gray-500 w-9 text-right shrink-0">{label}</span>
      <span className={`text-sm font-black w-8 shrink-0 tabular-nums ${quality}`}>{value}</span>
      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full stat-bar-fill"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-gray-600 w-8 shrink-0 tabular-nums">{pct}%</span>
    </div>
  );
}
