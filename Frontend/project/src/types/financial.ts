export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'income' | 'expense';
}

export interface MonthlyAnalysis {
  income: number;
  expenses: number;
  categories: Record<string, number>;
}

export interface CardAnalysis {
  total: number;
  transactions: Transaction[];
}

export interface InvestmentAnalysis {
  monthlyInvestmentGoal: number;
  monthlyEmergencyFundGoal: number;
  totalMonthlyGoal: number;
  currentSavings: number;
  canMeetGoals: boolean;
  suggestedOptimizations: string[];
}

export interface FinancialPlanning {
  essentialExpenses: number;
  discretionaryExpenses: number;
  savings: number;
  currentSavingsRate: number;
  suggestedBudget: {
    housing: number;
    utilities: number;
    food: number;
    transportation: number;
    healthcare: number;
    entertainment: number;
    savings: number;
  };
}

export interface FinancialAnalysis {
  insights: string[];
  recommendations: string[];
  spendingPatterns: {
    category: string;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
  monthlySummary: {
    totalIncome: number;
    totalExpenses: number;
    savings: number;
  };
  monthlyAnalysis: Record<string, MonthlyAnalysis>;
  cardAnalysis: Record<string, CardAnalysis>;
  investmentAnalysis: InvestmentAnalysis;
  financialPlanning: FinancialPlanning;
}

export interface AIAssistantResponse {
  message: string;
  analysis: FinancialAnalysis;
  suggestedActions: string[];
} 