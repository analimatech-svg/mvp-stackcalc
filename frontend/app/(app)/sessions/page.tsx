'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Session } from '@/types';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.sessions.list().then(setSessions).finally(() => setLoading(false));
  }, []);

  const createSession = async () => {
    setCreating(true);
    try {
      const session = await api.sessions.create();
      router.push(`/sessions/${session.id}`);
    } catch {
      setCreating(false);
    }
  };

  const phaseColors: Record<string, string> = {
    qualify: 'text-yellow-400',
    estimate: 'text-blue-400',
    defend: 'text-purple-400',
    validate: 'text-green-400',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-100">Sessões</h1>
        <button
          onClick={createSession}
          disabled={creating}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl transition-colors"
        >
          {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Nova Sessão
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="text-center py-16">
          <MessageSquare size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Nenhuma sessão ainda.</p>
          <p className="text-gray-600 text-xs mt-1">Crie uma para começar a estimar.</p>
        </div>
      )}

      <div className="space-y-3">
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => router.push(`/sessions/${s.id}`)}
            className="w-full text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-xl p-4 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">
                  {s.title || 'Sessão sem título'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(s.updated_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span className={`text-xs font-medium capitalize shrink-0 ${phaseColors[s.phase] || 'text-gray-400'}`}>
                {s.phase}
              </span>
            </div>
            {s.complexity_pct != null && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${s.complexity_pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-500">{s.complexity_pct}%</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
