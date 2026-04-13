import { useState, useEffect, useRef } from 'react';
import type { PokemonBasic, PokemonFull } from './types/pokemon';
import { fetchPokemonList, fetchPokemon } from './utils/api';
import SearchBar from './components/SearchBar';
import PokemonCard from './components/PokemonCard';
import PokemonDetail from './components/PokemonDetail';
import LoadingSpinner from './components/LoadingSpinner';

const PAGE_SIZE = 24;

// Pokéball SVG logo
function PokeballLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5B5B" />
          <stop offset="100%" stopColor="#CC1F1F" />
        </linearGradient>
      </defs>
      {/* Top half */}
      <path d="M50 2 A48 48 0 0 1 98 50 L2 50 A48 48 0 0 1 50 2Z" fill="url(#topGrad)" />
      {/* Bottom half */}
      <path d="M50 98 A48 48 0 0 1 2 50 L98 50 A48 48 0 0 1 50 98Z" fill="white" />
      {/* Outer ring */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="#111827" strokeWidth="4" />
      {/* Belt */}
      <rect x="2" y="44" width="96" height="12" fill="#111827" />
      {/* Center button */}
      <circle cx="50" cy="50" r="14" fill="#111827" />
      <circle cx="50" cy="50" r="9" fill="white" />
      <circle cx="46" cy="46" r="3.5" fill="rgba(255,255,255,0.7)" />
    </svg>
  );
}

export default function App() {
  const [pokemonList, setPokemonList] = useState<PokemonBasic[]>([]);
  const [filteredList, setFilteredList] = useState<PokemonBasic[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonFull | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const pokemonListRef = useRef<PokemonBasic[]>([]);
  pokemonListRef.current = pokemonList;

  // Initial load
  useEffect(() => {
    loadPokemon(0, true);
  }, []);

  async function loadPokemon(currentOffset: number, reset: boolean) {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await fetchPokemonList(PAGE_SIZE, currentOffset);
      if (reset) {
        setPokemonList(data);
        setFilteredList(data);
      } else {
        const merged = [...pokemonListRef.current, ...data];
        setPokemonList(merged);
        if (!searchQuery) setFilteredList(merged);
      }
      setHasMore(data.length === PAGE_SIZE);
      setOffset(currentOffset + data.length);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    setSearchError('');

    const q = query.toLowerCase().trim();

    if (!q) {
      setFilteredList(pokemonListRef.current);
      return;
    }

    // Filter loaded list
    const filtered = pokemonListRef.current.filter(
      (p) => p.name.includes(q) || p.id.toString() === q
    );
    setFilteredList(filtered);

    // If not found locally, try API (name or number)
    if (filtered.length === 0) {
      setSearching(true);
      try {
        const poke = await fetchPokemon(q);
        setFilteredList([{ name: poke.name, id: poke.id }]);
      } catch {
        setFilteredList([]);
        setSearchError(`Pokémon "${query}" não encontrado.`);
      } finally {
        setSearching(false);
      }
    }
  }

  async function handleSelectPokemon(id: number) {
    setSearching(true);
    try {
      const poke = await fetchPokemon(id);
      setSelectedPokemon(poke);
    } catch (err) {
      console.error('Erro ao buscar Pokémon:', err);
    } finally {
      setSearching(false);
    }
  }

  const isSearching = !!searchQuery;

  return (
    <div className="min-h-screen bg-[#0a0a1a] font-inter">
      {/* Ambient glow background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-600/[0.06] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/[0.06] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/[0.03] rounded-full blur-3xl" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 px-4 sm:px-6 pt-10 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Logo row */}
          <div className="flex items-center gap-3 mb-1">
            <PokeballLogo />
            <div>
              <h1 className="text-4xl font-black tracking-tight gradient-text">Pokédex</h1>
              <p className="text-gray-600 text-xs font-medium">Powered by PokéAPI</p>
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-8 ml-[52px]">
            {pokemonList.length > 0
              ? `${pokemonList.length} Pokémons carregados`
              : 'Carregando...'}
          </p>

          {/* Search */}
          <SearchBar onSearch={handleSearch} loading={searching} />
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 px-4 sm:px-6 pb-16">
        <div className="max-w-6xl mx-auto">

          {/* Search status */}
          {isSearching && (
            <div className="mb-5 animate-fade-in">
              {searchError ? (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {searchError}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  <span className="text-white font-semibold">{filteredList.length}</span>
                  {' '}resultado{filteredList.length !== 1 ? 's' : ''} para{' '}
                  <span className="text-gray-300">"{searchQuery}"</span>
                </p>
              )}
            </div>
          )}

          {/* Loading initial */}
          {loading && (
            <LoadingSpinner size="lg" label="Carregando Pokémons..." />
          )}

          {/* Empty state */}
          {!loading && filteredList.length === 0 && !searchError && (
            <div className="text-center py-20 animate-fade-in">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-400 text-lg font-semibold">Nenhum Pokémon encontrado</p>
              <p className="text-gray-600 text-sm mt-1">Tente um nome ou número diferente</p>
            </div>
          )}

          {/* Pokemon grid */}
          {!loading && filteredList.length > 0 && (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 animate-fade-in">
              {filteredList.map((p) => (
                <PokemonCard
                  key={p.id}
                  name={p.name}
                  id={p.id}
                  onSelect={handleSelectPokemon}
                />
              ))}
            </div>
          )}

          {/* Load more */}
          {!loading && !isSearching && hasMore && filteredList.length > 0 && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => loadPokemon(offset, false)}
                disabled={loadingMore}
                className="group flex items-center gap-2 px-8 py-3 bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loadingMore ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Carregando...
                  </>
                ) : (
                  <>
                    Carregar mais Pokémons
                    <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Searching overlay indicator */}
      {searching && !selectedPokemon && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-[#1e1e3a] border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl text-sm text-gray-300 animate-fade-in">
          <svg className="animate-spin w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Buscando Pokémon...
        </div>
      )}

      {/* Pokemon detail modal */}
      {selectedPokemon && (
        <PokemonDetail
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
          onSelectPokemon={handleSelectPokemon}
        />
      )}
    </div>
  );
}
