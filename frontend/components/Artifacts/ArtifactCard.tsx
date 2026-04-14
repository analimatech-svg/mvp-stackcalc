'use client';
import { Artifact } from '@/types';
import { FileText, CheckSquare, BarChart3, Mail, MessageSquare, TrendingUp } from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
  checklist: CheckSquare,
  scorecard: BarChart3,
  calculator_ab: TrendingUp,
  rfc: FileText,
  onepage: FileText,
  email: Mail,
  slack: MessageSquare,
  variance: TrendingUp,
};

const TYPE_LABELS: Record<string, string> = {
  checklist: 'Checklist de Escopo',
  scorecard: 'Score Card',
  calculator_ab: 'Calculadora A/B',
  rfc: 'RFC Técnico',
  onepage: 'One Page Executiva',
  email: 'Email de Defesa',
  slack: 'Mensagem Slack',
  variance: 'Rel. de Variância',
};

interface Props {
  artifact: Artifact;
  onExpand?: () => void;
}

export function ArtifactCard({ artifact, onExpand }: Props) {
  const Icon = ICONS[artifact.type] ?? FileText;
  const label = TYPE_LABELS[artifact.type] ?? artifact.type;

  return (
    <button
      onClick={onExpand}
      className="flex items-center gap-3 w-full text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-600 rounded-xl p-3 transition-all group"
    >
      <div className="w-9 h-9 rounded-lg bg-blue-900/50 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-200 truncate">{label}</p>
        <p className="text-[11px] text-gray-500 truncate">
          {artifact.title || label}
        </p>
      </div>
      <span className="text-xs text-gray-600 group-hover:text-blue-400 transition-colors">→</span>
    </button>
  );
}
