// Adicionar novo tipo para cartões de crédito
export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
}

// Modificar a interface Expense para incluir mais informações do cartão
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: CategoryType;
  date: string;
  isFixed: boolean;
  installments: number;
  currentInstallment?: number;
  isPaid: boolean;
  creditCard?: string;
  creditCardGroup?: string;
  recurrence: RecurrenceType;
  creditCardClosingDate?: string;
  creditCardDueDate?: string;
  dueDay?: number;
}

export interface MonthlyReport {
  month: string;
  totalExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  installmentExpenses: number;
  expensesByCategory: Record<string, number>;
  expensesByCreditCard: Record<string, number>;
  expensesByDueDay: Record<string, number>;
  paidExpenses: number;
  unpaidExpenses: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
  percentage: number;
}

export interface CreditCardTotal {
  creditCard: string;
  total: number;
  percentage: number;
}

export const CATEGORIES = {
  'moradia': 'Moradia',
  'utilidades': 'Luz/Água/Internet',
  'carro': 'Carro',
  'gasolina': 'Gasolina',
  'diversos': 'Diversos',
  'lazer': 'Lazer',
  'comida': 'Comida',
  'educacao': 'Educação',
  'roupa': 'Roupa'
} as const;

export type CategoryType = keyof typeof CATEGORIES;

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  'moradia': '#4338ca',     // Azul escuro para Moradia
  'utilidades': '#0ea5e9',  // Azul claro para Luz/Água/Internet
  'carro': '#0284c7',      // Azul médio para Carro
  'gasolina': '#059669',    // Verde escuro para Gasolina
  'diversos': '#6b7280',    // Cinza para Diversos
  'lazer': '#8b5cf6',      // Roxo para Lazer
  'comida': '#f97316',      // Laranja para Comida
  'educacao': '#0369a1',    // Azul royal para Educação
  'roupa': '#db2777'        // Rosa para Roupa
};

// Definir a interface para configuração do cartão de crédito
export interface CreditCardConfig {
  name: string;
  color: string;
  closingDay: number;
  dueDay: number;
}

// Definir os cartões de crédito disponíveis
export const CREDIT_CARDS: Record<string, CreditCardConfig> = {
  'Nubank': {
    name: 'Nubank',
    color: '#8A05BE',
    closingDay: 6,
    dueDay: 13,
  },
  'Santander': {
    name: 'Santander',
    color: '#EC0000',
    closingDay: 15,
    dueDay: 22,
  },
  'Porto': {
    name: 'Porto',
    color: '#1C3F95',
    closingDay: 20,
    dueDay: 27,
  },
};

export type CreditCardType = keyof typeof CREDIT_CARDS;

export const CREDIT_CARD_COLORS: Record<string, string> = {
  'Nubank': '#8A05BE',
  'Santander': '#EC0000',
  'Porto': '#1C3F95',
  'Mastercard': '#FF5F00',
  'Visa': '#1A1F71',
  'American Express': '#006FCF',
  'Elo': '#00A4E0',
};

export type RecurrenceType = 'one-time' | 'monthly' | 'yearly';