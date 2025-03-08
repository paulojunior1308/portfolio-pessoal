import React from 'react';
import { CreditCard } from 'lucide-react';
import { CREDIT_CARDS, Expense, CreditCardConfig } from '../types';
import { format, parseISO, isSameMonth, isSameYear, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CreditCardSummaryProps {
  expenses: Expense[];
  selectedMonth: string;
}

interface CardData {
  total: number;
  paid: number;
  pending: number;
  expenses: Expense[];
  monthTotal: number;
}

const CreditCardSummary: React.FC<CreditCardSummaryProps> = ({ expenses, selectedMonth }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para calcular o número da parcela atual
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

  // Função para calcular o valor da parcela para o mês selecionado
  const calculateInstallmentValue = (expense: Expense, targetDate: Date): number => {
    const expenseDate = parseISO(expense.date);
    
    // Se não for parcelado, retorna o valor total
    if (Number(expense.installments) <= 1) {
      return expense.amount;
    }

    // Calcula a diferença de meses
    const monthsDiff = 
      (targetDate.getFullYear() - expenseDate.getFullYear()) * 12 + 
      (targetDate.getMonth() - expenseDate.getMonth());

    // Se for antes do início do parcelamento
    if (monthsDiff < 0) return 0;
    
    // Se já passou do número total de parcelas
    if (monthsDiff >= Number(expense.installments)) return 0;

    // Verifica se o mês selecionado é igual ou posterior ao mês da despesa
    if (targetDate >= expenseDate) {
      return expense.amount;
    }

    return 0;
  };

  // Filtrar e calcular despesas do mês selecionado
  const calculateMonthlyExpenses = () => {
    const selectedDate = parseISO(`${selectedMonth}-01`);
    const result: Record<string, CardData> = {};

    expenses.forEach(expense => {
      if (!expense.creditCard || !CREDIT_CARDS[expense.creditCard]) {
        return;
      }

      if (!result[expense.creditCard]) {
        result[expense.creditCard] = {
          total: 0,
          paid: 0,
          pending: 0,
          expenses: [],
          monthTotal: 0
        };
      }

      const expenseDate = parseISO(expense.date);
      const installmentValue = calculateInstallmentValue(expense, selectedDate);

      // Se há valor para este mês
      if (installmentValue > 0) {
        result[expense.creditCard].expenses.push(expense);
        result[expense.creditCard].monthTotal += installmentValue;

        if (expense.isPaid) {
          result[expense.creditCard].paid += installmentValue;
        } else {
          result[expense.creditCard].pending += installmentValue;
        }

        // Calcula o total da fatura (incluindo todas as parcelas futuras)
        if (isSameMonth(expenseDate, selectedDate) && isSameYear(expenseDate, selectedDate)) {
          result[expense.creditCard].total += expense.amount;
        }
      }
    });

    return result;
  };

  const cardExpenses = calculateMonthlyExpenses();

  // Calcular as datas de fechamento e vencimento para o mês selecionado
  const getDatesForMonth = (cardConfig: CreditCardConfig) => {
    const selectedDate = parseISO(`${selectedMonth}-01`);
    const closingDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), cardConfig.closingDay);
    const dueDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), cardConfig.dueDay);
    
    if (Number(cardConfig.closingDay) > Number(cardConfig.dueDay)) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }
    
    return {
      closing: format(closingDate, 'dd/MM/yyyy', { locale: ptBR }),
      due: format(dueDate, 'dd/MM/yyyy', { locale: ptBR })
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(CREDIT_CARDS).map(([cardName, cardConfig]) => {
        const cardData = cardExpenses[cardName] || {
          total: 0,
          paid: 0,
          pending: 0,
          expenses: [],
          monthTotal: 0
        };
        const dates = getDatesForMonth(cardConfig);

        return (
          <div 
            key={cardName}
            className="bg-white rounded-lg shadow-md overflow-hidden"
            style={{ borderTop: `4px solid ${cardConfig.color}` }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" style={{ color: cardConfig.color }} />
                  <h3 className="text-lg font-semibold" style={{ color: cardConfig.color }}>
                    {cardConfig.name}
                  </h3>
                </div>
                <span className="text-sm px-2 py-1 rounded" style={{ 
                  backgroundColor: `${cardConfig.color}20`,
                  color: cardConfig.color 
                }}>
                  {cardData.expenses.length} despesas
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor deste mês:</span>
                  <span className="font-semibold">{formatCurrency(cardData.monthTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pago:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(cardData.paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pendente:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(cardData.pending)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fechamento:</span>
                  <span>{dates.closing}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vencimento:</span>
                  <span>{dates.due}</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Despesas do Mês:</h4>
                <div className="space-y-1">
                  {cardData.expenses.map((expense, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{expense.description}</span>
                      <div className="flex items-center">
                        <span className="font-medium">
                          {formatCurrency(calculateInstallmentValue(expense, parseISO(`${selectedMonth}-01`)))}
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
  );
};

export default CreditCardSummary;