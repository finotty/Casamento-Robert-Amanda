export interface Gift {
  id: number;
  name: string;
  price: number;
  category: string;
  icon: string;
  taken: boolean;
  takenBy: string;
  takenDate: string;
  customPrice?: boolean;
}

export const INITIAL_GIFTS: Gift[] = [
  { id: 10, name: 'PIX surpresa', price: 0, category: 'surpresa', icon: '🎁', taken: false, takenBy: '', takenDate: '', customPrice: true },
  { id: 1, name: 'Televisão 65 polegadas', price: 4200, category: 'casa', icon: '📺', taken: false, takenBy: '', takenDate: '' },
  { id: 2, name: 'Geladeira', price: 3800, category: 'casa', icon: '🧊', taken: false, takenBy: '', takenDate: '' },
  { id: 3, name: 'Máquina de lavar', price: 2600, category: 'casa', icon: '🧺', taken: false, takenBy: '', takenDate: '' },
  { id: 4, name: 'Jogo de panelas', price: 850, category: 'cozinha', icon: '🍳', taken: false, takenBy: '', takenDate: '' },
  { id: 5, name: 'Liquidificador', price: 320, category: 'cozinha', icon: '🥤', taken: false, takenBy: '', takenDate: '' },
  { id: 6, name: 'Air Fryer', price: 650, category: 'cozinha', icon: '🍟', taken: false, takenBy: '', takenDate: '' },
  { id: 7, name: 'Noite romântica', price: 300, category: 'lua-de-mel', icon: '🌙', taken: false, takenBy: '', takenDate: '' },
  { id: 8, name: 'Passeio especial', price: 500, category: 'lua-de-mel', icon: '✈️', taken: false, takenBy: '', takenDate: '' },
  { id: 9, name: 'Manual do noivo', price: 99, category: 'diversao', icon: '📖', taken: false, takenBy: '', takenDate: '' }
];

export const CATEGORIES = {
  'casa': 'Casa',
  'cozinha': 'Cozinha',
  'lua-de-mel': 'Lua de Mel',
  'diversao': 'Diversão',
  'surpresa': 'Surpresa'
};

export function formatPrice(price: number): string {
  if (price === 0) {
    return 'Valor livre';
  }
  // Usa formatação brasileira com separador de milhar (ex: 20.000,00)
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getCategoryName(category: string): string {
  return CATEGORIES[category as keyof typeof CATEGORIES] || category;
}
