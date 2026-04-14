'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api, streamChat } from '@/lib/api';
import { Session, Message, Artifact, Phase, SSEEvent } from '@/types';
import { MessageBubble } from '@/components/Chat/MessageBubble';
import { ChatInput } from '@/components/Chat/ChatInput';
import { PhaseBar } from '@/components/Chat/PhaseBar';
import { ArtifactCard } from '@/components/Artifacts/ArtifactCard';
import { ArtifactPanel } from '@/components/Artifacts/ArtifactPanel';
import { Loader2 } from 'lucide-react';

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [phase, setPhase] = useState<Phase>('qualify');
  const [completeness, setCompleteness] = useState(0);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.sessions.get(id).then((s) => {
      setSession(s);
      setMessages(s.messages);
      setPhase(s.phase);
    });
    api.sessions.artifacts(id).then(setArtifacts);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const sendMessage = useCallback(async (message: string) => {
    if (isStreaming) return;
    setError(null);
    setIsStreaming(true);
    setStreamingContent('');

    const userMsg: Message = {
      role: 'user',
      content: message,
      ts: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    let accumulated = '';

    try {
      for await (const event of streamChat(id, message)) {
        if (event.type === 'token') {
          accumulated += event.content;
          setStreamingContent(accumulated);
        } else if (event.type === 'phase_update') {
          setPhase(event.phase);
          setCompleteness(event.completeness);
        } else if (event.type === 'artifact_ready') {
          setArtifacts((prev) => [...prev, event.artifact]);
        } else if (event.type === 'done') {
          // Commit streaming content as assistant message
          const assistantMsg: Message = {
            role: 'assistant',
            content: accumulated,
            phase: event.session_state?.phase as Phase,
            ts: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
          setStreamingContent('');
          if (event.session_state?.phase) setPhase(event.session_state.phase as Phase);
        } else if (event.type === 'error') {
          setError(event.message);
          setStreamingContent('');
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
      setStreamingContent('');
    } finally {
      setIsStreaming(false);
    }
  }, [id, isStreaming]);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-gray-500" size={24} />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        <PhaseBar currentPhase={phase} completeness={completeness} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-900/30 flex items-center justify-center mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-200 mb-2">
                {session.title || 'Nova Sessão'}
              </h2>
              <p className="text-sm text-gray-500 max-w-sm">
                Descreva a demanda que você precisa estimar. Vou guiá-lo pelo ciclo StackCalc.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {/* Streaming preview */}
          {streamingContent && (
            <MessageBubble
              message={{ role: 'assistant', content: streamingContent, ts: '' }}
            />
          )}
          {isStreaming && !streamingContent && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">S</div>
              <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-auto max-w-md bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-300 mb-4">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4">
          <ChatInput onSend={sendMessage} disabled={isStreaming} />
          <p className="text-[11px] text-gray-600 text-center mt-2">
            StackCalc Agent · Fase: <span className="text-gray-500">{phase}</span>
          </p>
        </div>
      </div>

      {/* Artifact sidebar */}
      {artifacts.length > 0 && !selectedArtifact && (
        <div className="w-64 border-l border-gray-800 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-800">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Artefatos ({artifacts.length})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {artifacts.map((art) => (
              <ArtifactCard
                key={art.id}
                artifact={art}
                onExpand={() => setSelectedArtifact(art)}
              />
            ))}
          </div>
        </div>
      )}

      {selectedArtifact && (
        <div className="w-96 border-l border-gray-800">
          <ArtifactPanel
            artifact={selectedArtifact}
            onClose={() => setSelectedArtifact(null)}
          />
        </div>
      )}
    </div>
  );
}
