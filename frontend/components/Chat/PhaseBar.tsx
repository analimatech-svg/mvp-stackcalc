'use client';
import { Phase } from '@/types';
import { clsx } from 'clsx';

const PHASES: { key: Phase; label: string; labelEn: string }[] = [
  { key: 'qualify', label: 'Qualificar', labelEn: 'Qualify' },
  { key: 'estimate', label: 'Estimar', labelEn: 'Estimate' },
  { key: 'defend', label: 'Defender', labelEn: 'Defend' },
  { key: 'validate', label: 'Validar', labelEn: 'Validate' },
];

interface Props {
  currentPhase: Phase;
  completeness: number; // 0–1
  locale?: string;
}

export function PhaseBar({ currentPhase, completeness, locale = 'pt-BR' }: Props) {
  const currentIdx = PHASES.findIndex((p) => p.key === currentPhase);

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-gray-900 border-b border-gray-800">
      {PHASES.map((phase, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const label = locale === 'pt-BR' ? phase.label : phase.labelEn;
        return (
          <div key={phase.key} className="flex items-center gap-1">
            <div
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                isDone && 'bg-green-900/50 text-green-400',
                isCurrent && 'bg-blue-900/70 text-blue-300 ring-1 ring-blue-500',
                !isDone && !isCurrent && 'text-gray-600',
              )}
            >
              <span
                className={clsx(
                  'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold',
                  isDone && 'bg-green-500 text-white',
                  isCurrent && 'bg-blue-500 text-white',
                  !isDone && !isCurrent && 'bg-gray-700 text-gray-500',
                )}
              >
                {isDone ? '✓' : idx + 1}
              </span>
              {label}
              {isCurrent && completeness > 0 && (
                <span className="text-[10px] text-blue-400">
                  {Math.round(completeness * 100)}%
                </span>
              )}
            </div>
            {idx < PHASES.length - 1 && (
              <div className={clsx('w-4 h-px', idx < currentIdx ? 'bg-green-700' : 'bg-gray-700')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
