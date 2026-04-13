import { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on load
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onSearch(e.target.value);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClear();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-2xl blur-xl opacity-30 transition-opacity pointer-events-none"
        style={{
          background: value ? 'linear-gradient(135deg, #ef444480, #3b82f680)' : 'transparent',
        }}
      />

      <div className="relative flex items-center">
        {/* Left icon */}
        <div className="absolute left-4 z-10 text-gray-400 pointer-events-none">
          {loading ? (
            <svg className="animate-spin w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Buscar por nome ou número (#001, pikachu...)"
          className="w-full bg-white/[0.07] backdrop-blur-md border border-white/[0.12] rounded-2xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-red-400/60 focus:bg-white/[0.1] transition-all text-sm font-medium"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Clear button */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-4 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Hint text */}
      {!value && (
        <p className="text-center text-gray-600 text-xs mt-2">
          Pressione <kbd className="bg-white/10 rounded px-1 py-0.5 font-mono">ESC</kbd> para limpar
        </p>
      )}
    </div>
  );
}
