export interface TypeColorInfo {
  bg: string;
  dark: string;
  light: string;
  gradient: string;
}

export const TYPE_COLORS: Record<string, TypeColorInfo> = {
  normal:   { bg: '#A8A878', dark: '#6D6D4E', light: '#f5f5f0', gradient: 'linear-gradient(135deg, #A8A878, #6D6D4E)' },
  fire:     { bg: '#F08030', dark: '#9C531F', light: '#fff3e6', gradient: 'linear-gradient(135deg, #F08030, #DD6610)' },
  water:    { bg: '#6890F0', dark: '#2980EF', light: '#e6eeff', gradient: 'linear-gradient(135deg, #6890F0, #386CEB)' },
  electric: { bg: '#F8D030', dark: '#A1871F', light: '#fffbe6', gradient: 'linear-gradient(135deg, #F8D030, #EEB510)' },
  grass:    { bg: '#78C850', dark: '#4E8234', light: '#edfae6', gradient: 'linear-gradient(135deg, #78C850, #5CA935)' },
  ice:      { bg: '#98D8D8', dark: '#638D8D', light: '#e8f8f8', gradient: 'linear-gradient(135deg, #98D8D8, #69C6C6)' },
  fighting: { bg: '#C03028', dark: '#7D1F1A', light: '#fde8e7', gradient: 'linear-gradient(135deg, #C03028, #A52820)' },
  poison:   { bg: '#A040A0', dark: '#682A68', light: '#f5e6f5', gradient: 'linear-gradient(135deg, #A040A0, #803380)' },
  ground:   { bg: '#E0C068', dark: '#927D44', light: '#fdf6e3', gradient: 'linear-gradient(135deg, #E0C068, #D9A12B)' },
  flying:   { bg: '#A890F0', dark: '#6264D3', light: '#f0ecff', gradient: 'linear-gradient(135deg, #A890F0, #9180C4)' },
  psychic:  { bg: '#F85888', dark: '#BF1959', light: '#ffe6f0', gradient: 'linear-gradient(135deg, #F85888, #E0386A)' },
  bug:      { bg: '#A8B820', dark: '#6D7815', light: '#f4f6e6', gradient: 'linear-gradient(135deg, #A8B820, #8B9A10)' },
  rock:     { bg: '#B8A038', dark: '#786824', light: '#f7f3e8', gradient: 'linear-gradient(135deg, #B8A038, #A48F2A)' },
  ghost:    { bg: '#705898', dark: '#493963', light: '#efe9f7', gradient: 'linear-gradient(135deg, #705898, #52417A)' },
  dragon:   { bg: '#7038F8', dark: '#4C08EF', light: '#ede6ff', gradient: 'linear-gradient(135deg, #7038F8, #4C08EF)' },
  dark:     { bg: '#705848', dark: '#49392F', light: '#ede8e5', gradient: 'linear-gradient(135deg, #705848, #4A3B30)' },
  steel:    { bg: '#B8B8D0', dark: '#787887', light: '#f0f0f5', gradient: 'linear-gradient(135deg, #B8B8D0, #9999AA)' },
  fairy:    { bg: '#EE99AC', dark: '#9B6470', light: '#fdf0f3', gradient: 'linear-gradient(135deg, #EE99AC, #E06F85)' },
};

export function getTypeColor(typeName: string): TypeColorInfo {
  return TYPE_COLORS[typeName] ?? TYPE_COLORS['normal'];
}
