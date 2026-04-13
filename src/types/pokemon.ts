export interface PokemonBasic {
  name: string;
  id: number;
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
  };
  is_hidden: boolean;
}

export interface PokemonSprites {
  front_default: string;
  other: {
    'official-artwork': {
      front_default: string;
      front_shiny: string;
    };
    dream_world: {
      front_default: string;
    };
  };
}

export interface PokemonFull {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  sprites: PokemonSprites;
  species: {
    name: string;
    url: string;
  };
}

export interface EvolutionStep {
  name: string;
  id: number;
  minLevel: number | null;
  trigger: string | null;
  item: string | null;
}

export interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }[];
  genera: {
    genus: string;
    language: { name: string };
  }[];
  evolution_chain: {
    url: string;
  };
  color: {
    name: string;
  };
  is_legendary: boolean;
  is_mythical: boolean;
}
