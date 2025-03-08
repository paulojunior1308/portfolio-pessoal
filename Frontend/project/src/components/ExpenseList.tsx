import React, { useState } from 'react';
import { format, parseISO, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Expense } from '../types';
import { CheckCircle, XCircle, Edit, Trash2, CreditCard, ChevronDown, ChevronRight } from 'lucide-react';
import { CATEGORIES, CATEGORY_COLORS, CREDIT_CARDS } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  onTogglePayment?: (id: string, isPaid: boolean) => void;
  disabled?: boolean;
  showPaymentStatus?: boolean;
  selectedMonth?: string;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ 
  expenses, 
  onEdit, 
  onDelete, 
  onTogglePayment,
  disabled = false,
  showPaymentStatus = true,
  selectedMonth = format(new Date(), 'yyyy-MM')
}): JSX.Element => {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  };

  // Função para calcular o número da parcela atual
  const calculateCurrentInstallment = (expense: Expense): number => {
    if (!expense.installments || Number(expense.installments) <= 1) return 1;
    
    const expenseDate = parseISO(expense.date);
    const targetDate = parseISO(`${selectedMonth}-01`);
    
    // Calcula a diferença de meses desde o início da despesa até o mês selecionado
    const monthsDiff = differenceInMonths(targetDate, expenseDate);
    
    // Considera a parcela inicial
    const startingInstallment = expense.currentInstallment || 1;
    
    // Calcula a parcela atual
    const currentInstallment = startingInstallment + monthsDiff;
    
    // Se for antes do início do parcelamento
    if (monthsDiff < 0) return startingInstallment;
    
    // Se já passou do número total de parcelas, retorna 0 para não mostrar
    if (currentInstallment > Number(expense.installments)) return 0;
    
    // Retorna o número da parcela atual
    return currentInstallment;
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Nenhuma despesa encontrada
      </div>
    );
  }

  // Agrupar despesas por dia de vencimento
  const expensesByDueDay = {
    '1': expenses.filter(expense => 
      // Se não for Nubank e tiver vencimento dia 1 ou não tiver dia definido
      expense.creditCard !== 'nubank' && (expense.dueDay === 1 || !expense.dueDay)
    ),
    '15': expenses.filter(expense => 
      // Se for Nubank ou tiver vencimento dia 15
      expense.creditCard === 'nubank' || expense.dueDay === 15
    )
  };

  // Agrupar despesas por cartão dentro de cada dia
  const expensesByDueDayAndCard = {
    '1': expensesByDueDay['1'].reduce((acc, expense) => {
      if (!expense.creditCard) {
        if (!acc['other']) acc['other'] = [];
        acc['other'].push(expense);
      } else {
        if (!acc[expense.creditCard]) acc[expense.creditCard] = [];
        acc[expense.creditCard].push(expense);
      }
      return acc;
    }, {} as Record<string, Expense[]>),
    '15': expensesByDueDay['15'].reduce((acc, expense) => {
      if (!expense.creditCard) {
        if (!acc['other']) acc['other'] = [];
        acc['other'].push(expense);
      } else {
        if (!acc[expense.creditCard]) acc[expense.creditCard] = [];
        acc[expense.creditCard].push(expense);
      }
      return acc;
    }, {} as Record<string, Expense[]>)
  };

  // Calcular totais por cartão para cada dia
  const cardTotalsByDueDay = {
    '1': Object.entries(expensesByDueDayAndCard['1']).reduce((acc, [cardName, cardExpenses]) => {
      acc[cardName] = cardExpenses.reduce((sum, expense) => {
        if (expense.isFixed) return sum + Number(expense.amount);
        const currentInstallment = calculateCurrentInstallment(expense);
        if (currentInstallment === 0) return sum;
        return sum + Number(expense.amount);
      }, 0);
      return acc;
    }, {} as Record<string, number>),
    '15': Object.entries(expensesByDueDayAndCard['15']).reduce((acc, [cardName, cardExpenses]) => {
      acc[cardName] = cardExpenses.reduce((sum, expense) => {
        if (expense.isFixed) return sum + Number(expense.amount);
        const currentInstallment = calculateCurrentInstallment(expense);
        if (currentInstallment === 0) return sum;
        return sum + Number(expense.amount);
      }, 0);
      return acc;
    }, {} as Record<string, number>)
  };

  const toggleCard = (cardName: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Vencimento Dia 1º */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Vencimento Dia 1º</h2>
        <div className="space-y-6">
          {Object.entries(expensesByDueDayAndCard['1']).map(([cardName, cardExpenses]) => {
            if (cardName === 'other') return null;

            const cardConfig = CREDIT_CARDS[cardName];
            const isExpanded = expandedCards[`1-${cardName}`];
            const filteredExpenses = cardExpenses.filter(expense => {
              if (expense.isFixed) return true;
              const currentInstallment = calculateCurrentInstallment(expense);
              if (currentInstallment === 0) return false;
              if (!expense.installments || Number(expense.installments) <= 1) {
                const expenseDate = parseISO(expense.date);
                return format(expenseDate, 'yyyy-MM') === selectedMonth;
              }
              return true;
            });

            if (filteredExpenses.length === 0) return null;

            return (
              <div key={cardName} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div 
                  className="p-5 cursor-pointer hover:bg-gray-50 flex items-center justify-between transition-colors duration-200"
                  onClick={() => toggleCard(`1-${cardName}`)}
                  style={{ borderLeft: `4px solid ${cardConfig.color}` }}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-6 w-6" style={{ color: cardConfig.color }} />
                    <div>
                      <span className="font-semibold text-base" style={{ color: cardConfig.color }}>
                        {cardConfig.name}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({filteredExpenses.length} {filteredExpenses.length === 1 ? 'despesa' : 'despesas'})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-lg">{formatCurrency(cardTotalsByDueDay['1'][cardName])}</span>
                    {isExpanded ? 
                      <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100">
      <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                            <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                            <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                            <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                            <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parcelas
                  </th>
                  {showPaymentStatus && (
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                      Ações
                    </th>
                  )}
                  {!showPaymentStatus && (
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Ações
                  </th>
                  )}
                </tr>
              </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {filteredExpenses.map((expense) => {
                    const currentInstallment = calculateCurrentInstallment(expense);
                            const valorExibido = Number(expense.amount);

                    return (
                              <tr key={expense.id} className={`group hover:bg-gray-50 transition-colors duration-150 ${expense.isPaid ? 'bg-green-50 hover:bg-green-100' : ''}`}>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col space-y-1">
                                    <div className="flex items-center justify-between md:justify-start">
                                    <span className="font-medium text-sm text-gray-900">{expense.description}</span>
                                      <span className="md:hidden text-sm font-medium text-gray-900 ml-2">
                                        {formatCurrency(valorExibido)}
                                        </span>
                                      </div>
                                    <div className="md:hidden flex flex-col space-y-1">
                                      {Number(expense.installments) > 1 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                                          Parcela {currentInstallment}/{expense.installments}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                        </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(valorExibido)}
                                  </span>
                        </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ 
                                    backgroundColor: `${CATEGORY_COLORS[expense.category]}15`,
                              color: CATEGORY_COLORS[expense.category]
                                  }}>
                            {CATEGORIES[expense.category]}
                          </span>
                        </td>
                                <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900">
                          {formatDate(expense.date)}
                        </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            expense.isFixed 
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                          }`}>
                            {expense.isFixed ? 'Fixa' : 'Variável'}
                          </span>
                        </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  {Number(expense.installments) > 1 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                              {currentInstallment}/{expense.installments}
                            </span>
                                  )}
                        </td>
                                  <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-2">
                                    {showPaymentStatus && onTogglePayment && (
                                        <button
                                          onClick={() => onTogglePayment(expense.id, !expense.isPaid)}
                                          className={`p-1.5 rounded-full transition-all duration-150 ${
                                            expense.isPaid 
                                              ? 'text-green-600 hover:bg-green-100' 
                                              : 'text-red-600 hover:bg-red-100'
                                          }`}
                                          disabled={disabled}
                                        >
                                        {expense.isPaid ? (
                                          <CheckCircle className="h-4 w-4" />
                                        ) : (
                                          <XCircle className="h-4 w-4" />
                                        )}
                                        </button>
                                      )}
                                    {onEdit && (
                                      <button
                                        onClick={() => onEdit(expense)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-all duration-150"
                                        disabled={disabled}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                    )}
                                    {onDelete && (
                                      <button
                                        onClick={() => onDelete(expense.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-all duration-150"
                                        disabled={disabled}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Outras despesas dia 1 */}
          {expensesByDueDayAndCard['1']['other'] && expensesByDueDayAndCard['1']['other'].length > 0 && (
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <div 
                className="p-5 cursor-pointer hover:bg-gray-50 flex items-center justify-between transition-colors duration-200"
                onClick={() => toggleCard('1-other')}
                style={{ borderLeft: '4px solid #718096' }}
              >
                <div className="flex items-center space-x-3">
                  <div>
                    <span className="font-semibold text-base text-gray-700">Outras Despesas</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({expensesByDueDayAndCard['1']['other'].length} {expensesByDueDayAndCard['1']['other'].length === 1 ? 'despesa' : 'despesas'})
                            </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-lg">{formatCurrency(cardTotalsByDueDay['1']['other'])}</span>
                  {expandedCards['1-other'] ? 
                    <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  }
                </div>
              </div>

              {expandedCards['1-other'] && (
                <div className="border-t border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descrição
                          </th>
                          <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                          </th>
                          <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categoria
                          </th>
                          <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data
                          </th>
                          <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parcelas
                          </th>
                          {showPaymentStatus && (
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                              Ações
                            </th>
                          )}
                          {!showPaymentStatus && (
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                            Ações
                          </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {expensesByDueDayAndCard['1']['other']
                          .filter(expense => {
                            if (expense.isFixed) return true;
                            const currentInstallment = calculateCurrentInstallment(expense);
                            if (currentInstallment === 0) return false;
                            if (!expense.installments || Number(expense.installments) <= 1) {
                              const expenseDate = parseISO(expense.date);
                              return format(expenseDate, 'yyyy-MM') === selectedMonth;
                            }
                            return true;
                          })
                          .map((expense) => {
                            const currentInstallment = calculateCurrentInstallment(expense);
                            const valorExibido = Number(expense.amount);

                            return (
                              <tr key={expense.id} className={`group hover:bg-gray-50 transition-colors duration-150 ${expense.isPaid ? 'bg-green-50 hover:bg-green-100' : ''}`}>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col space-y-1">
                                    <div className="flex items-center justify-between md:justify-start">
                                    <span className="font-medium text-sm text-gray-900">{expense.description}</span>
                                      <span className="md:hidden text-sm font-medium text-gray-900 ml-2">
                                        {formatCurrency(valorExibido)}
                                        </span>
                                      </div>
                                    <div className="md:hidden flex flex-col space-y-1">
                                      {Number(expense.installments) > 1 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                                          Parcela {currentInstallment}/{expense.installments}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(valorExibido)}
                                  </span>
                                </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ 
                                    backgroundColor: `${CATEGORY_COLORS[expense.category]}15`,
                                    color: CATEGORY_COLORS[expense.category]
                                  }}>
                                    {CATEGORIES[expense.category]}
                                  </span>
                                </td>
                                <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900">
                                  {formatDate(expense.date)}
                                </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                    expense.isFixed 
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {expense.isFixed ? 'Fixa' : 'Variável'}
                                  </span>
                                </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  {Number(expense.installments) > 1 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                                      {currentInstallment}/{expense.installments}
                                    </span>
                                  )}
                        </td>
                                  <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-2">
                                    {showPaymentStatus && onTogglePayment && (
                              <button
                                onClick={() => onTogglePayment(expense.id, !expense.isPaid)}
                                          className={`p-1.5 rounded-full transition-all duration-150 ${
                                  expense.isPaid 
                                    ? 'text-green-600 hover:bg-green-100' 
                                    : 'text-red-600 hover:bg-red-100'
                                }`}
                                disabled={disabled}
                              >
                                        {expense.isPaid ? (
                                          <CheckCircle className="h-4 w-4" />
                                        ) : (
                                          <XCircle className="h-4 w-4" />
                                        )}
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={() => onEdit(expense)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-all duration-150"
                                disabled={disabled}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(expense.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-all duration-150"
                                disabled={disabled}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vencimento Dia 15 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Vencimento Dia 15</h2>
        <div className="space-y-6">
          {Object.entries(expensesByDueDayAndCard['15']).map(([cardName, cardExpenses]) => {
            if (cardName === 'other') return null;

            const cardConfig = CREDIT_CARDS[cardName];
            const isExpanded = expandedCards[`15-${cardName}`];
            const filteredExpenses = cardExpenses.filter(expense => {
              if (expense.isFixed) return true;
              const currentInstallment = calculateCurrentInstallment(expense);
              if (currentInstallment === 0) return false;
              if (!expense.installments || Number(expense.installments) <= 1) {
                const expenseDate = parseISO(expense.date);
                return format(expenseDate, 'yyyy-MM') === selectedMonth;
              }
              return true;
            });

            if (filteredExpenses.length === 0) return null;

            return (
              <div key={cardName} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div 
                  className="p-5 cursor-pointer hover:bg-gray-50 flex items-center justify-between transition-colors duration-200"
                  onClick={() => toggleCard(`15-${cardName}`)}
                  style={{ borderLeft: `4px solid ${cardConfig.color}` }}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-6 w-6" style={{ color: cardConfig.color }} />
          <div>
                      <span className="font-semibold text-base" style={{ color: cardConfig.color }}>
                        {cardConfig.name}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({filteredExpenses.length} {filteredExpenses.length === 1 ? 'despesa' : 'despesas'})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-lg">{formatCurrency(cardTotalsByDueDay['15'][cardName])}</span>
                    {isExpanded ? 
                      <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                            <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                            <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                            <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                            <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parcelas
                  </th>
                  {showPaymentStatus && (
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                      Ações
                    </th>
                  )}
                  {!showPaymentStatus && (
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Ações
                  </th>
                  )}
                </tr>
              </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {filteredExpenses.map((expense) => {
                    const currentInstallment = calculateCurrentInstallment(expense);
                            const valorExibido = Number(expense.amount);

                    return (
                              <tr key={expense.id} className={`group hover:bg-gray-50 transition-colors duration-150 ${expense.isPaid ? 'bg-green-50 hover:bg-green-100' : ''}`}>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col space-y-1">
                                    <div className="flex items-center justify-between md:justify-start">
                                    <span className="font-medium text-sm text-gray-900">{expense.description}</span>
                                      <span className="md:hidden text-sm font-medium text-gray-900 ml-2">
                                        {formatCurrency(valorExibido)}
                                        </span>
                                      </div>
                                    <div className="md:hidden flex flex-col space-y-1">
                                      {Number(expense.installments) > 1 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                                          Parcela {currentInstallment}/{expense.installments}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                        </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(valorExibido)}
                                  </span>
                        </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ 
                                    backgroundColor: `${CATEGORY_COLORS[expense.category]}15`,
                              color: CATEGORY_COLORS[expense.category]
                                  }}>
                            {CATEGORIES[expense.category]}
                          </span>
                        </td>
                                <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900">
                          {formatDate(expense.date)}
                        </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            expense.isFixed 
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                          }`}>
                            {expense.isFixed ? 'Fixa' : 'Variável'}
                          </span>
                        </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  {Number(expense.installments) > 1 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                              {currentInstallment}/{expense.installments}
                            </span>
                                  )}
                        </td>
                                  <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-2">
                                    {showPaymentStatus && onTogglePayment && (
                                        <button
                                          onClick={() => onTogglePayment(expense.id, !expense.isPaid)}
                                          className={`p-1.5 rounded-full transition-all duration-150 ${
                                            expense.isPaid 
                                              ? 'text-green-600 hover:bg-green-100' 
                                              : 'text-red-600 hover:bg-red-100'
                                          }`}
                                          disabled={disabled}
                                        >
                                        {expense.isPaid ? (
                                          <CheckCircle className="h-4 w-4" />
                                        ) : (
                                          <XCircle className="h-4 w-4" />
                                        )}
                                        </button>
                                      )}
                                    {onEdit && (
                                      <button
                                        onClick={() => onEdit(expense)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-all duration-150"
                                        disabled={disabled}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                    )}
                                    {onDelete && (
                                      <button
                                        onClick={() => onDelete(expense.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-all duration-150"
                                        disabled={disabled}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Outras despesas dia 15 */}
          {expensesByDueDayAndCard['15']['other'] && expensesByDueDayAndCard['15']['other'].length > 0 && (
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <div 
                className="p-5 cursor-pointer hover:bg-gray-50 flex items-center justify-between transition-colors duration-200"
                onClick={() => toggleCard('15-other')}
                style={{ borderLeft: '4px solid #718096' }}
              >
                <div className="flex items-center space-x-3">
                  <div>
                    <span className="font-semibold text-base text-gray-700">Outras Despesas</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({expensesByDueDayAndCard['15']['other'].length} {expensesByDueDayAndCard['15']['other'].length === 1 ? 'despesa' : 'despesas'})
                            </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-lg">{formatCurrency(cardTotalsByDueDay['15']['other'])}</span>
                  {expandedCards['15-other'] ? 
                    <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  }
                </div>
              </div>

              {expandedCards['15-other'] && (
                <div className="border-t border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descrição
                          </th>
                          <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                          </th>
                          <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categoria
                          </th>
                          <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data
                          </th>
                          <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parcelas
                          </th>
                          {showPaymentStatus && (
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                              Ações
                            </th>
                          )}
                          {!showPaymentStatus && (
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                            Ações
                          </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {expensesByDueDayAndCard['15']['other']
                          .filter(expense => {
                            if (expense.isFixed) return true;
                            const currentInstallment = calculateCurrentInstallment(expense);
                            if (currentInstallment === 0) return false;
                            if (!expense.installments || Number(expense.installments) <= 1) {
                              const expenseDate = parseISO(expense.date);
                              return format(expenseDate, 'yyyy-MM') === selectedMonth;
                            }
                            return true;
                          })
                          .map((expense) => {
                            const currentInstallment = calculateCurrentInstallment(expense);
                            const valorExibido = Number(expense.amount);

                            return (
                              <tr key={expense.id} className={`group hover:bg-gray-50 transition-colors duration-150 ${expense.isPaid ? 'bg-green-50 hover:bg-green-100' : ''}`}>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col space-y-1">
                                    <div className="flex items-center justify-between md:justify-start">
                                    <span className="font-medium text-sm text-gray-900">{expense.description}</span>
                                      <span className="md:hidden text-sm font-medium text-gray-900 ml-2">
                                        {formatCurrency(valorExibido)}
                                        </span>
                                      </div>
                                    <div className="md:hidden flex flex-col space-y-1">
                                      {Number(expense.installments) > 1 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                                          Parcela {currentInstallment}/{expense.installments}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(valorExibido)}
                                  </span>
                                </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ 
                                    backgroundColor: `${CATEGORY_COLORS[expense.category]}15`,
                                    color: CATEGORY_COLORS[expense.category]
                                  }}>
                                    {CATEGORIES[expense.category]}
                                  </span>
                                </td>
                                <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900">
                                  {formatDate(expense.date)}
                                </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                    expense.isFixed 
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {expense.isFixed ? 'Fixa' : 'Variável'}
                                  </span>
                                </td>
                                <td className="hidden md:table-cell px-4 py-3">
                                  {Number(expense.installments) > 1 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                                      {currentInstallment}/{expense.installments}
                                    </span>
                                  )}
                        </td>
                                  <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-2">
                                    {showPaymentStatus && onTogglePayment && (
                              <button
                                onClick={() => onTogglePayment(expense.id, !expense.isPaid)}
                                          className={`p-1.5 rounded-full transition-all duration-150 ${
                                  expense.isPaid 
                                    ? 'text-green-600 hover:bg-green-100' 
                                    : 'text-red-600 hover:bg-red-100'
                                }`}
                                disabled={disabled}
                              >
                                        {expense.isPaid ? (
                                          <CheckCircle className="h-4 w-4" />
                                        ) : (
                                          <XCircle className="h-4 w-4" />
                                        )}
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={() => onEdit(expense)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-all duration-150"
                                disabled={disabled}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(expense.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-all duration-150"
                                disabled={disabled}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;