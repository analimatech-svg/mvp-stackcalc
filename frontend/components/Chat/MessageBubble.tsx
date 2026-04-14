'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types';
import { clsx } from 'clsx';

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  return (
    <div className={clsx('flex gap-3 mb-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          S
        </div>
      )}
      <div
        className={clsx(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-800 text-gray-100 rounded-bl-sm',
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children }) => (
                <table className="text-xs border-collapse w-full my-2">{children}</table>
              ),
              th: ({ children }) => (
                <th className="border border-gray-600 px-2 py-1 text-left bg-gray-700">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border border-gray-600 px-2 py-1">{children}</td>
              ),
              code: ({ children }) => (
                <code className="bg-gray-700 px-1 rounded text-xs font-mono">{children}</code>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          U
        </div>
      )}
    </div>
  );
}
