import { useEffect, useState } from 'react';
import type { PokemonType } from '../types/pokemon';
import { fetchPokemon, getArtworkUrl } from '../utils/api';
import { getTypeColor } from '../utils/typeColors';
import TypeBadge from './TypeBadge';

interface PokemonCardProps {
  name: string;
  id: number;
  onSelect: (id: number) => void;
}

export default function PokemonCard({ name, id, onSelect }: PokemonCardProps) {
  const [types, setTypes] = useState<PokemonType[]>([]);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const artworkUrl = getArtworkUrl(id);
  const formattedId = `#${id.toString().padStart(3, '0')}`;
  const primaryType = types[0]?.type.name ?? 'normal';
  const color = getTypeColor(primaryType);

  useEffect(() => {
    fetchPokemon(id)
      .then((data) => setTypes(data.types))
      .catch(() => setTypes([]));
  }, [id]);

  return (
    <button
      onClick={() => onSelect(id)}
      className="pokemon-card relative w-full text-left rounded-2xl overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer group"
      style={{
        background: types.length
          ? `linear-gradient(145deg, ${color.bg}22 0%, ${color.dark}44 100%)`
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${types.length ? color.bg + '30' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      {/* Decorative pokéball ring */}
      <div
        className="absolute -right-5 -bottom-5 w-24 h-24 rounded-full opacity-[0.08] pointer-events-none"
        style={{ border: `10px solid ${color.bg}` }}
      />

      <div className="relative p-4 pb-2">
        {/* ID */}
        <p className="text-xs font-bold text-white/30 mb-0.5 tabular-nums">{formattedId}</p>

        {/* Name */}
        <p className="text-sm font-bold text-white capitalize leading-tight mb-2 line-clamp-1">
          {name}
        </p>

        {/* Types */}
        <div className="flex flex-wrap gap-1 min-h-[20px]">
          {types.length === 0 ? (
            <div className="h-5 w-14 bg-white/10 rounded-full animate-pulse" />
          ) : (
            types.map((t) => (
              <TypeBadge key={t.slot} type={t.type.name} size="xs" />
            ))
          )}
        </div>
      </div>

      {/* Pokemon image */}
      <div className="relative flex justify-end pr-2 pb-2 mt-1 h-20">
        {!imgError && (
          <img
            src={artworkUrl}
            alt={name}
            width={80}
            height={80}
            className={`absolute bottom-1 right-1 w-20 h-20 object-contain pokemon-artwork transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
        {(!imgLoaded && !imgError) && (
          <div className="absolute bottom-1 right-1 w-20 h-20 rounded-full bg-white/5 animate-pulse" />
        )}
      </div>
    </button>
  );
}
