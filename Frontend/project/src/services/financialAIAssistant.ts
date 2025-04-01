import { Transaction, FinancialAnalysis, AIAssistantResponse } from '../types/financial';

export class FinancialAIAssistant {
  private analyzeTransactions(transactions: Transaction[]): FinancialAnalysis {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');

    // Análise de padrões de gastos
    const categoryTotals = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const totalIncome = income.reduce((a, b) => a + b.amount, 0);

    // Análise mensal
    const monthlyAnalysis = this.analyzeMonthlyPatterns(transactions);
    
    // Análise de cartões
    const cardAnalysis = this.analyzeCardExpenses(transactions);
    
    // Análise de investimentos e metas
    const investmentAnalysis = this.analyzeInvestmentGoals(transactions, totalIncome);
    
    // Planejamento financeiro
    const financialPlanning = this.createFinancialPlanning(totalIncome, totalExpenses);

    // Gerar insights baseados nos dados
    const insights = this.generateInsights(transactions, totalIncome, totalExpenses, monthlyAnalysis, cardAnalysis);
    const recommendations = this.generateRecommendations(transactions, totalIncome, totalExpenses, investmentAnalysis);
    
    // Análise de tendências
    const spendingPatterns = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      percentage: (amount / totalExpenses) * 100,
      trend: this.analyzeTrend(transactions, category)
    }));

    return {
      insights,
      recommendations,
      spendingPatterns,
      monthlySummary: {
        totalIncome,
        totalExpenses,
        savings: totalIncome - totalExpenses
      },
      monthlyAnalysis,
      cardAnalysis,
      investmentAnalysis,
      financialPlanning
    };
  }

  private analyzeMonthlyPatterns(transactions: Transaction[]) {
    const monthlyTotals = transactions.reduce((acc, curr) => {
      const month = curr.date.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          income: 0,
          expenses: 0,
          categories: {}
        };
      }
      
      if (curr.type === 'income') {
        acc[month].income += curr.amount;
      } else {
        acc[month].expenses += curr.amount;
        acc[month].categories[curr.category] = (acc[month].categories[curr.category] || 0) + curr.amount;
      }
      
      return acc;
    }, {} as Record<string, { income: number; expenses: number; categories: Record<string, number> }>);

    return monthlyTotals;
  }

  private analyzeCardExpenses(transactions: Transaction[]) {
    const cardCategories = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => {
        if (!acc[curr.category]) {
          acc[curr.category] = {
            total: 0,
            transactions: []
          };
        }
        acc[curr.category].total += curr.amount;
        acc[curr.category].transactions.push(curr);
        return acc;
      }, {} as Record<string, { total: number; transactions: Transaction[] }>);

    return cardCategories;
  }

  private analyzeInvestmentGoals(transactions: Transaction[], totalIncome: number) {
    const monthlyInvestmentGoal = 500;
    const monthlyEmergencyFundGoal = 500;
    const totalMonthlyGoal = monthlyInvestmentGoal + monthlyEmergencyFundGoal;
    
    const currentSavings = totalIncome - transactions
      .filter(t => t.type === 'expense')
      .reduce((a, b) => a + b.amount, 0);

    return {
      monthlyInvestmentGoal,
      monthlyEmergencyFundGoal,
      totalMonthlyGoal,
      currentSavings,
      canMeetGoals: currentSavings >= totalMonthlyGoal,
      suggestedOptimizations: this.findOptimizationOpportunities(transactions, totalMonthlyGoal)
    };
  }

  private createFinancialPlanning(totalIncome: number, totalExpenses: number) {
    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    
    // Regra 50/30/20
    const essentialExpenses = totalIncome * 0.5;
    const discretionaryExpenses = totalIncome * 0.3;
    const savings = totalIncome * 0.2;

    return {
      essentialExpenses,
      discretionaryExpenses,
      savings,
      currentSavingsRate: savingsRate,
      suggestedBudget: {
        housing: totalIncome * 0.3,
        utilities: totalIncome * 0.1,
        food: totalIncome * 0.1,
        transportation: totalIncome * 0.1,
        healthcare: totalIncome * 0.05,
        entertainment: totalIncome * 0.15,
        savings: totalIncome * 0.2
      }
    };
  }

  private findOptimizationOpportunities(transactions: Transaction[], monthlyGoal: number) {
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>);

    const suggestions: string[] = [];
    
    // Identificar categorias com gastos excessivos
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > monthlyGoal) {
        suggestions.push(`Considere reduzir gastos em ${category} em ${((amount - monthlyGoal) / amount * 100).toFixed(1)}%`);
      }
    });

    return suggestions;
  }

  private generateInsights(
    transactions: Transaction[], 
    totalIncome: number, 
    totalExpenses: number,
    monthlyAnalysis: any,
    cardAnalysis: any
  ): string[] {
    const insights: string[] = [];
    
    if (totalExpenses > totalIncome) {
      insights.push('Seus gastos estão excedendo sua renda. Considere reduzir despesas ou aumentar sua renda.');
    }

    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    if (savingsRate < 20) {
      insights.push('Sua taxa de poupança está abaixo do recomendado (20%). Tente aumentar suas economias.');
    }

    // Análise de padrões mensais
    const months = Object.keys(monthlyAnalysis);
    if (months.length > 1) {
      const lastMonth = months[months.length - 1];
      const previousMonth = months[months.length - 2];
      
      if (monthlyAnalysis[lastMonth].expenses > monthlyAnalysis[previousMonth].expenses * 1.1) {
        insights.push(`Seus gastos aumentaram ${((monthlyAnalysis[lastMonth].expenses / monthlyAnalysis[previousMonth].expenses - 1) * 100).toFixed(1)}% em relação ao mês anterior.`);
      }
    }

    // Análise de categorias de cartão
    Object.entries(cardAnalysis).forEach(([category, data]: [string, any]) => {
      if (data.total > totalIncome * 0.3) {
        insights.push(`Seus gastos com ${category} representam mais de 30% da sua renda. Considere revisar esses gastos.`);
      }
    });

    return insights;
  }

  private generateRecommendations(
    transactions: Transaction[], 
    totalIncome: number, 
    totalExpenses: number,
    investmentAnalysis: any
  ): string[] {
    const recommendations: string[] = [];
    
    if (totalExpenses > totalIncome) {
      recommendations.push('Crie um orçamento detalhado para controlar seus gastos');
      recommendations.push('Identifique e elimine gastos desnecessários');
    }

    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    if (savingsRate < 20) {
      recommendations.push('Estabeleça uma meta de economia mensal');
      recommendations.push('Considere automatizar suas economias');
    }

    // Recomendações para investimentos
    if (!investmentAnalysis.canMeetGoals) {
      recommendations.push(...investmentAnalysis.suggestedOptimizations);
      recommendations.push('Considere revisar suas despesas fixas para liberar mais recursos para investimentos');
    }

    return recommendations;
  }

  private analyzeTrend(transactions: Transaction[], category: string): 'increasing' | 'decreasing' | 'stable' {
    const categoryTransactions = transactions
      .filter(t => t.category === category)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (categoryTransactions.length < 2) return 'stable';

    const firstHalf = categoryTransactions.slice(0, Math.floor(categoryTransactions.length / 2));
    const secondHalf = categoryTransactions.slice(Math.floor(categoryTransactions.length / 2));

    const firstHalfTotal = firstHalf.reduce((a, b) => a + b.amount, 0);
    const secondHalfTotal = secondHalf.reduce((a, b) => a + b.amount, 0);

    const difference = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;

    if (difference > 10) return 'increasing';
    if (difference < -10) return 'decreasing';
    return 'stable';
  }

  public async analyzeFinancialData(transactions: Transaction[]): Promise<AIAssistantResponse> {
    const analysis = this.analyzeTransactions(transactions);
    
    return {
      message: 'Análise financeira concluída com sucesso!',
      analysis,
      suggestedActions: [
        'Revise seus gastos por categoria',
        'Estabeleça metas financeiras mensais',
        'Monitore suas economias regularmente',
        'Acompanhe o progresso dos seus investimentos'
      ]
    };
  }
} 