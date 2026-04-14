'use client';
import { useState, useRef, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = 'Digite sua mensagem...' }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const msg = value.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex gap-2 items-end bg-gray-800 rounded-2xl p-3 border border-gray-700 focus-within:border-blue-500 transition-colors">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label="Mensagem"
        className="flex-1 bg-transparent text-gray-100 text-sm resize-none outline-none placeholder-gray-500 min-h-[24px] max-h-[160px] leading-6"
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Enviar mensagem"
        className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
      >
        <Send size={16} className="text-white" />
      </button>
    </div>
  );
}
