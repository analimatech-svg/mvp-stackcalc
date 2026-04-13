import type { PokemonBasic, PokemonFull, PokemonSpecies, EvolutionStep } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';
const cache = new Map<string, unknown>();

async function fetchCached<T>(url: string): Promise<T> {
  if (cache.has(url)) return cache.get(url) as T;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const data = await res.json();
  cache.set(url, data);
  return data as T;
}

function getIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, '').split('/');
  return parseInt(parts[parts.length - 1], 10);
}

export async function fetchPokemonList(limit = 20, offset = 0): Promise<PokemonBasic[]> {
  const data = await fetchCached<{ results: { name: string; url: string }[] }>(
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
  );
  return data.results.map((p) => ({
    name: p.name,
    id: getIdFromUrl(p.url),
  }));
}

export async function fetchPokemon(nameOrId: string | number): Promise<PokemonFull> {
  return fetchCached<PokemonFull>(`${BASE_URL}/pokemon/${nameOrId}`);
}

export async function fetchPokemonSpecies(nameOrId: string | number): Promise<PokemonSpecies> {
  return fetchCached<PokemonSpecies>(`${BASE_URL}/pokemon-species/${nameOrId}`);
}

// Recursively flatten the evolution chain into an array of steps
function flattenChain(node: {
  species: { name: string; url: string };
  evolution_details: { min_level: number | null; trigger: { name: string }; item: { name: string } | null }[];
  evolves_to: unknown[];
}): EvolutionStep {
  return {
    name: node.species.name,
    id: getIdFromUrl(node.species.url),
    minLevel: node.evolution_details?.[0]?.min_level ?? null,
    trigger: node.evolution_details?.[0]?.trigger?.name ?? null,
    item: node.evolution_details?.[0]?.item?.name ?? null,
  };
}

type ChainNode = {
  species: { name: string; url: string };
  evolution_details: { min_level: number | null; trigger: { name: string }; item: { name: string } | null }[];
  evolves_to: ChainNode[];
};

function collectBranches(node: ChainNode, current: EvolutionStep[]): EvolutionStep[][] {
  const step = flattenChain(node);
  const path = [...current, step];

  if (node.evolves_to.length === 0) return [path];

  const branches: EvolutionStep[][] = [];
  for (const child of node.evolves_to) {
    branches.push(...collectBranches(child, path));
  }
  return branches;
}

export async function fetchEvolutionChain(speciesUrl: string): Promise<{
  primaryChain: EvolutionStep[];
  allBranches: EvolutionStep[][];
}> {
  const species = await fetchCached<PokemonSpecies>(speciesUrl);
  const chainData = await fetchCached<{ chain: ChainNode }>(species.evolution_chain.url);

  const allBranches = collectBranches(chainData.chain, []);
  const primaryChain = allBranches[0] ?? [];

  return { primaryChain, allBranches };
}

export function getArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function getSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
