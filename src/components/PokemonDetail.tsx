import { useEffect, useState, useCallback } from 'react';
import type { PokemonFull, PokemonSpecies } from '../types/pokemon';
import { fetchPokemonSpecies, getArtworkUrl } from '../utils/api';
import { getTypeColor } from '../utils/typeColors';
import TypeBadge from './TypeBadge';
import StatBar from './StatBar';
import EvolutionChain from './EvolutionChain';

interface PokemonDetailProps {
  pokemon: PokemonFull;
  onClose: () => void;
  onSelectPokemon: (id: number) => void;
}

type Tab = 'stats' | 'evolution' | 'info';

const TOTAL_POKEMON = 1025;

export default function PokemonDetail({ pokemon, onClose, onSelectPokemon }: PokemonDetailProps) {
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [shiny, setShiny] = useState(false);

  const primaryType = pokemon.types[0]?.type.name ?? 'normal';
  const secondaryType = pokemon.types[1]?.type.name;
  const color = getTypeColor(primaryType);
  const color2 = secondaryType ? getTypeColor(secondaryType) : null;

  const artwork = shiny
    ? pokemon.sprites?.other?.['official-artwork']?.front_shiny ?? getArtworkUrl(pokemon.id)
    : getArtworkUrl(pokemon.id);

  const formattedId = `#${pokemon.id.toString().padStart(3, '0')}`;

  const description = species?.flavor_text_entries
    .find((e) => e.language.name === 'en' || e.language.name === 'pt')
    ?.flavor_text
    .replace(/\f|\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() ?? '';

  const category = species?.genera.find((g) => g.language.name === 'en')?.genus ?? '';
  const totalStats = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);

  const handleClose = useCallback(() => onClose(), [onClose]);

  // Escape key close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    document.body.classList.add('modal-open');
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.classList.remove('modal-open');
    };
  }, [handleClose]);

  // Fetch species when pokemon changes
  useEffect(() => {
    setSpecies(null);
    setImgLoaded(false);
    setActiveTab('stats');
    setShiny(false);
    fetchPokemonSpecies(pokemon.id).then(setSpecies).catch(console.error);
  }, [pokemon.id]);

  const navigatePokemon = (dir: -1 | 1) => {
    const newId = pokemon.id + dir;
    if (newId >= 1 && newId <= TOTAL_POKEMON) onSelectPokemon(newId);
  };

  const bgGradient = color2
    ? `linear-gradient(135deg, ${color.bg}40 0%, ${color2.bg}30 100%)`
    : `linear-gradient(135deg, ${color.bg}40 0%, ${color.dark}50 100%)`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full sm:max-w-md max-h-[95dvh] sm:max-h-[90vh] flex flex-col sm:rounded-3xl overflow-hidden shadow-2xl animate-slide-up"
        style={{ background: '#13132a', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* ── Header ── */}
        <div
          className="relative px-6 pt-6 pb-20 shrink-0"
          style={{ background: bgGradient }}
        >
          {/* Nav: prev / close / next */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigatePokemon(-1)}
              disabled={pokemon.id <= 1}
              className="p-2 rounded-full bg-black/20 hover:bg-black/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
              title="Pokémon anterior"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-black/20 hover:bg-black/40 transition-all text-white"
              title="Fechar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={() => navigatePokemon(1)}
              disabled={pokemon.id >= TOTAL_POKEMON}
              className="p-2 rounded-full bg-black/20 hover:bg-black/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
              title="Próximo Pokémon"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* ID + Name */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/40 text-sm font-bold tabular-nums">{formattedId}</p>
              <h2 className="text-3xl font-black text-white capitalize leading-tight mt-0.5">
                {pokemon.name}
              </h2>
              {category && (
                <p className="text-white/50 text-xs mt-1">{category}</p>
              )}
            </div>

            {/* Shiny toggle */}
            <button
              onClick={() => setShiny(!shiny)}
              className={`mt-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                shiny
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
                  : 'bg-white/10 text-gray-400 border border-white/10 hover:text-white'
              }`}
              title="Ver versão shiny"
            >
              ✨ Shiny
            </button>
          </div>

          {/* Types */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {pokemon.types.map((t) => (
              <TypeBadge key={t.slot} type={t.type.name} size="md" />
            ))}
            {species?.is_legendary && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-yellow-400/15 text-yellow-300 border border-yellow-400/30">
                ⭐ Lendário
              </span>
            )}
            {species?.is_mythical && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-purple-400/15 text-purple-300 border border-purple-400/30">
                💫 Mítico
              </span>
            )}
          </div>

          {/* Floating artwork */}
          <div className="absolute right-4 bottom-0 translate-y-1/2 pointer-events-none">
            <div className={`transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <img
                key={artwork}
                src={artwork}
                alt={pokemon.name}
                width={160}
                height={160}
                className="w-40 h-40 object-contain pokemon-artwork animate-float"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgLoaded(true)}
              />
            </div>
            {!imgLoaded && (
              <div className="w-40 h-40 rounded-full bg-white/5 animate-pulse" />
            )}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-6 pt-24 pb-6 space-y-5">

          {/* Description */}
          {description && (
            <p className="text-gray-300 text-sm leading-relaxed bg-white/[0.04] rounded-xl px-4 py-3 border border-white/5">
              {description}
            </p>
          )}

          {/* Physical grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Altura', value: `${(pokemon.height / 10).toFixed(1)} m` },
              { label: 'Peso', value: `${(pokemon.weight / 10).toFixed(1)} kg` },
              { label: 'Exp. Base', value: pokemon.base_experience ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/[0.05] rounded-xl p-3 text-center border border-white/5">
                <p className="text-gray-500 text-[11px] font-medium mb-1">{label}</p>
                <p className="text-white font-black text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Abilities */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Habilidades
            </h3>
            <div className="flex flex-wrap gap-2">
              {pokemon.abilities.map((a, i) => (
                <span
                  key={i}
                  className={`px-3 py-1 rounded-full text-sm capitalize font-medium ${
                    a.is_hidden
                      ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                      : 'bg-white/[0.07] border border-white/10 text-gray-200'
                  }`}
                >
                  {a.ability.name.replace(/-/g, ' ')}
                  {a.is_hidden && <span className="ml-1 text-xs text-purple-500">(oculta)</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/[0.04] rounded-xl p-1 flex gap-1 border border-white/[0.06]">
            {(['stats', 'evolution', 'info'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-white/[0.12] text-white shadow'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'stats' ? '📊 Stats' : tab === 'evolution' ? '🔄 Evoluções' : 'ℹ️ Info'}
              </button>
            ))}
          </div>

          {/* Tab: Stats */}
          {activeTab === 'stats' && (
            <div className="space-y-2.5">
              {pokemon.stats.map((s) => (
                <StatBar key={s.stat.name} stat={s.stat.name} value={s.base_stat} />
              ))}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
                <span
                  className="text-lg font-black tabular-nums"
                  style={{ color: totalStats >= 500 ? '#f5ac78' : totalStats >= 400 ? '#a7db8d' : '#9DB7F5' }}
                >
                  {totalStats}
                </span>
              </div>
            </div>
          )}

          {/* Tab: Evolution */}
          {activeTab === 'evolution' && (
            <EvolutionChain
              speciesUrl={pokemon.species.url}
              currentId={pokemon.id}
              onSelectPokemon={(id) => {
                onSelectPokemon(id);
                onClose();
              }}
            />
          )}

          {/* Tab: Info */}
          {activeTab === 'info' && (
            <div className="space-y-0.5">
              {[
                { label: 'ID Nacional', value: formattedId },
                { label: 'Nome', value: pokemon.name, capitalize: true },
                { label: 'Categoria', value: category || '—' },
                { label: 'Cor', value: species?.color.name ?? '—', capitalize: true },
                { label: 'Lendário', value: species?.is_legendary ? 'Sim ⭐' : 'Não' },
                { label: 'Mítico', value: species?.is_mythical ? 'Sim 💫' : 'Não' },
              ].map(({ label, value, capitalize }) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2.5 border-b border-white/[0.06] last:border-0"
                >
                  <span className="text-gray-500 text-sm">{label}</span>
                  <span className={`text-white text-sm font-semibold ${capitalize ? 'capitalize' : ''}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
