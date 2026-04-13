interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
  const sizes = { sm: 28, md: 48, lg: 72 };
  const px = sizes[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animation: 'pokeball-spin 1s linear infinite' }}
      >
        {/* Top half - red */}
        <path d="M50 2 A48 48 0 0 1 98 50 L2 50 A48 48 0 0 1 50 2Z" fill="#FF3B3B" />
        {/* Bottom half - white */}
        <path d="M50 98 A48 48 0 0 1 2 50 L98 50 A48 48 0 0 1 50 98Z" fill="white" />
        {/* Outer ring */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="#1a1a2e" strokeWidth="3" />
        {/* Center belt */}
        <rect x="2" y="45" width="96" height="10" fill="#1a1a2e" />
        {/* Center button outer */}
        <circle cx="50" cy="50" r="14" fill="#1a1a2e" />
        {/* Center button inner */}
        <circle cx="50" cy="50" r="9" fill="white" />
        {/* Center button highlight */}
        <circle cx="46" cy="46" r="3" fill="rgba(255,255,255,0.6)" />
      </svg>
      {label && (
        <span className="text-gray-400 text-sm animate-pulse">{label}</span>
      )}
    </div>
  );
}
