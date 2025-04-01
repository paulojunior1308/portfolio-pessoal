import React, { useState } from 'react';
import { FinancialAIAssistant } from '../services/financialAIAssistant';
import { Transaction, AIAssistantResponse } from '../types/financial';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { Expense } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

interface FinancialAssistantProps {
  expenses: Expense[];
}

export const FinancialAssistant: React.FC<FinancialAssistantProps> = ({ expenses }) => {
  const [analysis, setAnalysis] = useState<AIAssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assistant = new FinancialAIAssistant();

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);

      // Converter despesas para o formato de transações
      const transactions: Transaction[] = expenses.map(expense => ({
        id: expense.id,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        date: new Date(expense.date),
        type: 'expense'
      }));

      const result = await assistant.analyzeFinancialData(transactions);
      setAnalysis(result);
    } catch (err) {
      setError('Erro ao analisar dados financeiros. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = analysis ? {
    labels: analysis.analysis.spendingPatterns.map(pattern => pattern.category),
    datasets: [{
      data: analysis.analysis.spendingPatterns.map(pattern => pattern.percentage),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384',
        '#36A2EB',
      ],
    }],
  } : null;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Assistente Financeiro IA</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={loading || expenses.length === 0}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Analisando...' : 'Analisar Dados Financeiros'}
      </button>

      {analysis && (
        <div className="mt-6 space-y-8">
          {/* Insights e Recomendações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Insights</h3>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                {analysis.analysis.insights.map((insight, index) => (
                  <li key={index} className="text-gray-700">{insight}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Recomendações</h3>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                {analysis.analysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700">{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Resumo Mensal */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Resumo Mensal</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-100 p-4 rounded-lg">
                <p className="font-semibold text-green-800">Receitas</p>
                <p className="text-2xl font-bold text-green-700">
                  R$ {analysis.analysis.monthlySummary.totalIncome.toFixed(2)}
                </p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <p className="font-semibold text-red-800">Despesas</p>
                <p className="text-2xl font-bold text-red-700">
                  R$ {analysis.analysis.monthlySummary.totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="font-semibold text-blue-800">Economias</p>
                <p className="text-2xl font-bold text-blue-700">
                  R$ {analysis.analysis.monthlySummary.savings.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Análise de Cartões */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Análise de Gastos por Categoria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {chartData && (
                <div className="w-full max-w-md mx-auto">
                  <Pie data={chartData} />
                </div>
              )}
              <div className="space-y-4">
                {Object.entries(analysis.analysis.cardAnalysis).map(([category, data]: [string, any]) => (
                  <div key={category} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800">{category}</h4>
                    <p className="text-gray-600">
                      Total: R$ {data.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {data.transactions.length} transações
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metas de Investimento */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Metas de Investimento</h3>
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-semibold text-purple-800">Meta Mensal de Investimento</p>
                  <p className="text-2xl font-bold text-purple-700">
                    R$ {analysis.analysis.investmentAnalysis.monthlyInvestmentGoal.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-purple-800">Meta Mensal de Fundo de Emergência</p>
                  <p className="text-2xl font-bold text-purple-700">
                    R$ {analysis.analysis.investmentAnalysis.monthlyEmergencyFundGoal.toFixed(2)}
                  </p>
                </div>
              </div>
              {!analysis.analysis.investmentAnalysis.canMeetGoals && (
                <div className="mt-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Sugestões para Otimização:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {analysis.analysis.investmentAnalysis.suggestedOptimizations.map((suggestion: string, index: number) => (
                      <li key={index} className="text-purple-700">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Planejamento Financeiro */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Planejamento Financeiro</h3>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="font-semibold text-yellow-800">Despesas Essenciais (50%)</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    R$ {analysis.analysis.financialPlanning.essentialExpenses.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-yellow-800">Despesas Discricionárias (30%)</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    R$ {analysis.analysis.financialPlanning.discretionaryExpenses.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-yellow-800">Economia (20%)</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    R$ {analysis.analysis.financialPlanning.savings.toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Orçamento Sugerido:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analysis.analysis.financialPlanning.suggestedBudget).map(([category, amount]) => (
                    <div key={category} className="bg-white p-3 rounded">
                      <p className="font-medium text-yellow-800 capitalize">{category}</p>
                      <p className="text-yellow-700">
                        R$ {(amount as number).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 