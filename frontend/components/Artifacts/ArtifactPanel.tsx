'use client';
import { Artifact } from '@/types';
import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  artifact: Artifact;
  onClose: () => void;
}

export function ArtifactPanel({ artifact, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(artifact.content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-100 truncate">{artifact.title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            aria-label="Copiar conteúdo"
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
          >
            {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
          </button>
          <button
            onClick={onClose}
            aria-label="Fechar painel"
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <ArtifactContent artifact={artifact} />
      </div>
    </div>
  );
}

function ArtifactContent({ artifact }: { artifact: Artifact }) {
  const { type, content } = artifact;

  if (type === 'checklist') {
    const items = (content.items as Array<{ dimension: string; filled: boolean; value: unknown }>) || [];
    return (
      <div>
        <p className="text-xs text-gray-500 mb-3">
          Preenchimento: {Math.round(((content.completeness as number) || 0) * 100)}%
        </p>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 py-2 border-b border-gray-800 last:border-0">
            <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${item.filled ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-500'}`}>
              {item.filled ? '✓' : '○'}
            </span>
            <span className="text-sm text-gray-300">{item.dimension}</span>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'scorecard') {
    const rows = (content.rows as Array<{ criterion: string; score: number; weight: number; weighted: number }>) || [];
    return (
      <div>
        <table className="w-full text-xs mb-3">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-1.5 text-gray-400">Critério</th>
              <th className="text-right py-1.5 text-gray-400">Score</th>
              <th className="text-right py-1.5 text-gray-400">Peso</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-800">
                <td className="py-1.5 text-gray-300">{r.criterion}</td>
                <td className="text-right text-gray-300">{r.score}</td>
                <td className="text-right text-gray-400">{r.weight}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-sm font-semibold text-blue-300">
          Score Total: {content.total_score as number}% — {content.level as string}
        </div>
      </div>
    );
  }

  if (type === 'calculator_ab') {
    const a = content.scenario_a as Record<string, number>;
    const b = content.scenario_b as Record<string, number>;
    return (
      <div className="space-y-4">
        <p className="text-xs text-gray-400">{content.explanation as string}</p>
        {[{ label: 'Cenário A — Escopo Completo', data: a }, { label: 'Cenário B — Escopo Reduzido (~35%)', data: b }].map(
          ({ label, data }) => (
            <div key={label} className="bg-gray-800 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-300 mb-2">{label}</p>
              {[['Dev', data.dev], ['Documentação', data.doc], ['Gestão + Conting.', data.mgmt], ['Total', data.total]].map(
                ([k, v]) => (
                  <div key={k as string} className="flex justify-between text-xs py-1 border-b border-gray-700 last:border-0">
                    <span className="text-gray-400">{k}</span>
                    <span className={`font-mono ${k === 'Total' ? 'text-white font-bold' : 'text-gray-300'}`}>{v}h</span>
                  </div>
                )
              )}
              <p className="text-xs text-gray-500 mt-1">{data.days} dias úteis</p>
            </div>
          )
        )}
      </div>
    );
  }

  // Generic markdown/text fallback
  const text = typeof content === 'string' ? content :
    (content.body as string) || (content.message as string) || (content.agent_narrative as string) ||
    JSON.stringify(content, null, 2);

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
