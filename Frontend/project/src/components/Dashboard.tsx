import React, { useState } from 'react';
import { Expense, CREDIT_CARDS } from '../types';
import { format, parseISO, addMonths, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORIES, CATEGORY_COLORS } from '../types';

interface DashboardProps {
  expenses: Expense[];
  salary: number;
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, salary }) => {
  const next12Months = Array.from({ length: 12 }, (_, i) => {
    const date = addMonths(new Date(), i);
    return format(date, 'yyyy-MM');
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatMonthDisplay = (monthStr: string): string => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const formattedMonth = format(date, 'MMMM yyyy', { locale: ptBR });
    return formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);
  };

  // Função auxiliar para calcular o número da parcela atual
  const calculateCurrentInstallment = (expense: Expense): number => {
    if (!expense.installments || Number(expense.installments) <= 1) return 1;
    
    const targetDate = parseISO(`${selectedMonth}-01`);
    const startDate = parseISO(expense.date);
    const startingInstallment = expense.currentInstallment || 1;
    
    // Calcula a diferença de meses entre a data inicial e o mês selecionado
    const monthsDiff = differenceInMonths(targetDate, startDate);
    
    // Se for antes do mês da despesa, retorna a parcela inicial
    if (monthsDiff < 0) return startingInstallment;
    
    // Calcula a parcela atual somando a diferença de meses com a parcela inicial
    const currentInstallment = startingInstallment + monthsDiff;
    
    // Se já passou do número total de parcelas, retorna 0 para não mostrar
    if (currentInstallment > Number(expense.installments)) return 0;
    
    // Retorna o número da parcela atual
    return currentInstallment;
  };

  // Cálculos para despesas fixas
  const fixedExpenses = expenses.filter(expense => expense.isFixed);
  const totalFixedExpenses = fixedExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  // Cálculos para despesas diversas (não fixas)
  const diverseExpenses = expenses.filter(expense => {
    const expenseDate = parseISO(expense.date);
    const isCurrentMonth = format(expenseDate, 'yyyy-MM') === selectedMonth;
    
    if (isCurrentMonth) return !expense.isFixed;
    
    // Para meses futuros, incluir apenas parcelas ativas
    if (!expense.isFixed && Number(expense.installments) > 1) {
      const currentInstallment = calculateCurrentInstallment(expense);
      return currentInstallment > 0 && currentInstallment <= Number(expense.installments);
    }
    
    return false;
  });

  const totalDiverseExpenses = diverseExpenses.reduce((sum, expense) => {
    const expenseDate = parseISO(expense.date);
    const isCurrentMonth = format(expenseDate, 'yyyy-MM') === selectedMonth;
    
    // Se for do mês atual, soma o valor total
    if (isCurrentMonth) return sum + Number(expense.amount);
    
    // Para despesas parceladas em meses futuros, soma apenas se o mês selecionado for igual ou posterior ao mês da despesa
    if (Number(expense.installments) > 1) {
      const currentInstallment = calculateCurrentInstallment(expense);
      if (currentInstallment > 0 && currentInstallment <= Number(expense.installments)) {
        // Verifica se o mês selecionado é igual ou posterior ao mês da despesa
        const selectedDate = parseISO(`${selectedMonth}-01`);
        const expenseMonth = parseISO(expense.date);
        
        if (selectedDate >= expenseMonth) {
          return sum + Number(expense.amount);
        }
      }
    }
    
    return sum;
  }, 0);

  // Cálculo do total de todas as despesas
  const totalExpenses = totalFixedExpenses + totalDiverseExpenses;

  // Cálculo do saldo do mês
  const monthlyBalance = salary - totalExpenses;

  // Função para calcular os gastos por categoria
  const calculateExpensesByCategory = () => {
    const categoryTotals: Record<string, number> = {};
    const targetDate = parseISO(`${selectedMonth}-01`);
    
    expenses.forEach(expense => {
      const expenseDate = parseISO(expense.date);
      const isCurrentMonth = format(expenseDate, 'yyyy-MM') === selectedMonth;
      const category = expense.category;
      const amount = Number(expense.amount);
      
      // Para despesas parceladas
      if (Number(expense.installments) > 1) {
        const currentInstallment = calculateCurrentInstallment(expense);
        // Só inclui se tiver parcela ativa no mês selecionado
        if (currentInstallment > 0 && currentInstallment <= Number(expense.installments)) {
          categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        }
      }
      // Para despesas fixas
      else if (expense.isFixed) {
        // Inclui despesas fixas apenas se já existiam no mês selecionado
        if (expenseDate <= targetDate) {
          categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        }
      }
      // Para despesas normais (não parceladas e não fixas)
      else if (isCurrentMonth) {
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      }
    });

    // Converter para o formato do gráfico e remover categorias com valor zero
    return Object.entries(categoryTotals)
      .filter(([, value]) => value > 0)
      .map(([category, value]) => ({
        name: CATEGORIES[category as keyof typeof CATEGORIES],
        value: value,
        color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
      }))
      .sort((a, b) => b.value - a.value); // Ordena por valor decrescente
  };

  const categoryData = calculateExpensesByCategory();

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      {/* Filtro de Mês */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <label htmlFor="month-select" className="text-gray-700 font-medium">
          Selecione o mês:
        </label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full md:w-64 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          {next12Months.map((month) => (
            <option key={month} value={month}>
              {formatMonthDisplay(month)}
            </option>
          ))}
        </select>
      </div>

      {/* Menus do Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-green-500">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Salário</h3>
          <p className="text-xl md:text-2xl font-bold text-green-600">{formatCurrency(salary)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-red-500">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Total de Despesas</h3>
          <p className="text-xl md:text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-blue-500">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Saldo do Mês</h3>
          <p className={`text-xl md:text-2xl font-bold ${monthlyBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(monthlyBalance)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-yellow-500">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Despesas Fixas</h3>
          <p className="text-xl md:text-2xl font-bold text-yellow-600">{formatCurrency(totalFixedExpenses)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-purple-500">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Despesas Diversas</h3>
          <p className="text-xl md:text-2xl font-bold text-purple-600">{formatCurrency(totalDiverseExpenses)}</p>
        </div>
      </div>

      {/* Gráfico de Distribuição de Gastos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6">Distribuição de Gastos por Categoria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => 
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(value)
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center">
            <div className="space-y-4">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {entry.name}: {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(entry.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Cartões de Crédito */}
      <h2 className="text-xl font-bold mb-6">Cartões de Crédito</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(CREDIT_CARDS).map(([cardName, cardConfig]) => {
          const cardExpenses = expenses.filter(expense => expense.creditCard === cardName);
          
          const monthExpenses = cardExpenses.filter(expense => {
            const expenseDate = parseISO(expense.date);
            const isCurrentMonth = format(expenseDate, 'yyyy-MM') === selectedMonth;
            
            // Se for despesa do mês atual e não parcelada
            if (isCurrentMonth && (!expense.installments || Number(expense.installments) <= 1)) {
              return true;
            }
            
            // Para despesas parceladas
            if (Number(expense.installments) > 1) {
              const currentInstallment = calculateCurrentInstallment(expense);
              // Só inclui se tiver parcela ativa para o mês selecionado
              return currentInstallment > 0 && currentInstallment <= Number(expense.installments);
            }
            
            return false;
          });

          const valorMes = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

          const valorPago = monthExpenses
            .filter(expense => {
              const expenseDate = parseISO(expense.date);
              return format(expenseDate, 'yyyy-MM') === selectedMonth && expense.isPaid;
            })
            .reduce((sum, expense) => sum + Number(expense.amount), 0);

          const valorPendente = valorMes - valorPago;

          return (
            <div key={cardName} className="bg-white p-4 rounded-lg border" style={{ borderColor: cardConfig.color }}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold" style={{ color: cardConfig.color }}>
                    {cardConfig.name}
                  </h3>
                </div>
                <span className="text-sm px-2 py-1 rounded" style={{ 
                  backgroundColor: `${cardConfig.color}20`,
                  color: cardConfig.color 
                }}>
                  {monthExpenses.length} despesas
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor deste mês:</span>
                  <span className="font-semibold">{formatCurrency(valorMes)}</span>
                </div>
                {format(new Date(2025, 2, cardConfig.closingDay), 'yyyy-MM') === selectedMonth && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pago:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(valorPago)}</span>
                  </div>
                )}
                {format(new Date(2025, 2, cardConfig.dueDay), 'yyyy-MM') === selectedMonth && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pendente:</span>
                    <span className="font-semibold text-red-600">{formatCurrency(valorPendente)}</span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fechamento:</span>
                    <span>{format(new Date(2025, 2, cardConfig.closingDay), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vencimento:</span>
                    <span>{format(new Date(2025, 2, cardConfig.dueDay), 'dd/MM/yyyy')}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Despesas do Mês:</h4>
                  <div className="space-y-1">
                    {monthExpenses.map((expense, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{expense.description}</span>
                        <div className="flex items-center">
                          <span className="font-medium">
                            {formatCurrency(Number(expense.amount))}
                          </span>
                          {Number(expense.installments) > 1 && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({calculateCurrentInstallment(expense)}/{expense.installments})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;