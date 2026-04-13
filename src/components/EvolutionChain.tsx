import { useEffect, useState } from 'react';
import type { EvolutionStep } from '../types/pokemon';
import { fetchEvolutionChain, getArtworkUrl } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

interface EvolutionChainProps {
  speciesUrl: string;
  currentId: number;
  onSelectPokemon: (id: number) => void;
}

function ArrowRight() {
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0 px-1">
      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

function EvolutionNode({
  step,
  isActive,
  onSelect,
}: {
  step: EvolutionStep;
  isActive: boolean;
  onSelect: (id: number) => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const artworkUrl = getArtworkUrl(step.id);

  return (
    <button
      onClick={() => onSelect(step.id)}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all hover:scale-105 min-w-[72px] ${
        isActive
          ? 'bg-white/15 ring-2 ring-white/30 shadow-lg'
          : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="relative w-16 h-16">
        <div className={`absolute inset-0 rounded-full ${imgLoaded ? 'opacity-0' : 'bg-white/10 animate-pulse'}`} />
        <img
          src={artworkUrl}
          alt={step.name}
          className={`w-16 h-16 object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
      </div>
      <span className="text-xs font-bold text-white capitalize text-center leading-tight">
        {step.name}
      </span>
      {step.minLevel && (
        <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-full">
          Nv. {step.minLevel}
        </span>
      )}
      {step.item && !step.minLevel && (
        <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-full capitalize">
          {step.item.replace(/-/g, ' ')}
        </span>
      )}
    </button>
  );
}

export default function EvolutionChain({ speciesUrl, currentId, onSelectPokemon }: EvolutionChainProps) {
  const [branches, setBranches] = useState<EvolutionStep[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchEvolutionChain(speciesUrl)
      .then(({ allBranches }) => setBranches(allBranches))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [speciesUrl]);

  if (loading) return <LoadingSpinner size="sm" />;

  const hasEvolutions = branches.some((b) => b.length > 1);
  if (!hasEvolutions) {
    return (
      <div className="text-center py-6">
        <p className="text-4xl mb-2">🥚</p>
        <p className="text-gray-500 text-sm">Este Pokémon não possui evoluções.</p>
      </div>
    );
  }

  // If multiple unique branches (like Eevee), show each path
  // If single path, show as one row
  const uniqueBranches = branches.length > 1 && branches[0].length === 1
    ? branches // e.g. Eevee: all are [Eevee → Vaporeon], [Eevee → Jolteon], etc.
    : [branches[0]]; // single chain

  // For Eevee-like cases, group the final evolutions in a grid
  const isMultiBranch = branches.length > 1;
  const baseStep = branches[0]?.[0];

  if (isMultiBranch && branches[0]?.length <= 2) {
    // Show base + grid of evolutions
    const evolutions = branches.map((b) => b[b.length - 1]);
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          {baseStep && (
            <EvolutionNode step={baseStep} isActive={baseStep.id === currentId} onSelect={onSelectPokemon} />
          )}
        </div>
        <div className="flex justify-center">
          <div className="w-px h-6 bg-gray-600" />
        </div>
        <div className="grid grid-cols-3 gap-2 justify-items-center">
          {evolutions.map((evo) => (
            <EvolutionNode key={evo.id} step={evo} isActive={evo.id === currentId} onSelect={onSelectPokemon} />
          ))}
        </div>
      </div>
    );
  }

  // Standard linear chain(s)
  return (
    <div className="space-y-3">
      {uniqueBranches.map((chain, idx) => (
        <div key={idx} className="flex items-center justify-center gap-1 flex-wrap">
          {chain.map((step, stepIdx) => (
            <div key={step.id} className="flex items-center gap-1">
              <EvolutionNode
                step={step}
                isActive={step.id === currentId}
                onSelect={onSelectPokemon}
              />
              {stepIdx < chain.length - 1 && <ArrowRight />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
