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
    <div className="space-y-8">
      {/* Vencimento Dia 1º */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Vencimento Dia 1º</h2>
        <div className="space-y-4">
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
              <div key={cardName} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => toggleCard(`1-${cardName}`)}
                  style={{ borderLeft: `4px solid ${cardConfig.color}` }}
                >
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" style={{ color: cardConfig.color }} />
                    <span className="font-semibold" style={{ color: cardConfig.color }}>
                      {cardConfig.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({filteredExpenses.length} despesas)
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">{formatCurrency(cardTotalsByDueDay['1'][cardName])}</span>
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                          <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                          <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parcelas
                  </th>
                  {showPaymentStatus && (
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  )}
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                        {filteredExpenses.map((expense) => {
                    const currentInstallment = calculateCurrentInstallment(expense);
                          const valorExibido = Number(expense.amount);

                    return (
                      <tr key={expense.id} className={`hover:bg-gray-50 ${expense.isPaid ? 'bg-green-50' : ''}`}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex flex-col md:flex-row md:items-center">
                                  <span className="font-medium">{expense.description}</span>
                                  <span className="text-xs text-gray-500 md:hidden mt-1">
                                    {formatDate(expense.date)}
                                  </span>
                                </div>
                        </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {formatCurrency(valorExibido)}
                        </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                          <span 
                            className="px-2 py-1 text-xs font-semibold rounded-full" 
                            style={{ 
                              backgroundColor: `${CATEGORY_COLORS[expense.category]}20`,
                              color: CATEGORY_COLORS[expense.category]
                            }}
                          >
                            {CATEGORIES[expense.category]}
                          </span>
                        </td>
                              <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900">
                          {formatDate(expense.date)}
                        </td>
                              <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            expense.isFixed 
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {expense.isFixed ? 'Fixa' : 'Variável'}
                          </span>
                        </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                          {Number(expense.installments) > 1 ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {currentInstallment}/{expense.installments}
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              À vista
                            </span>
                          )}
                        </td>
                        {showPaymentStatus && (
                                <td className="px-4 py-3 text-sm text-gray-900">
                            {expense.isPaid ? (
                              <span className="inline-flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                      <span className="hidden md:inline">Pago</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-600">
                                <XCircle className="h-4 w-4 mr-1" />
                                      <span className="hidden md:inline">Pendente</span>
                              </span>
                            )}
                          </td>
                              )}
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex items-center justify-end space-x-2">
                                  {onTogglePayment && (
                                    <button
                                      onClick={() => onTogglePayment(expense.id, !expense.isPaid)}
                                      className={`p-1 rounded-full transition-colors ${
                                        expense.isPaid 
                                          ? 'text-green-600 hover:bg-green-100' 
                                          : 'text-red-600 hover:bg-red-100'
                                      }`}
                                      disabled={disabled}
                                    >
                                      {expense.isPaid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    </button>
                                  )}
                                  {onEdit && (
                                    <button
                                      onClick={() => onEdit(expense)}
                                      className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                      disabled={disabled}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                  )}
                                  {onDelete && (
                                    <button
                                      onClick={() => onDelete(expense.id)}
                                      className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
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
                )}
              </div>
            );
          })}

          {/* Outras despesas dia 1 */}
          {expensesByDueDayAndCard['1']['other'] && expensesByDueDayAndCard['1']['other'].length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                onClick={() => toggleCard('1-other')}
                style={{ borderLeft: '4px solid #718096' }}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-700">Outras Despesas</span>
                  <span className="text-sm text-gray-500">
                    ({expensesByDueDayAndCard['1']['other'].length} despesas)
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold">{formatCurrency(cardTotalsByDueDay['1']['other'])}</span>
                  {expandedCards['1-other'] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
              </div>

              {expandedCards['1-other'] && (
                <div className="border-t">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Parcelas
                        </th>
                        {showPaymentStatus && (
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        )}
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
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
                            <tr key={expense.id} className={`hover:bg-gray-50 ${expense.isPaid ? 'bg-green-50' : ''}`}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex flex-col md:flex-row md:items-center">
                                  <span className="font-medium">{expense.description}</span>
                                  <span className="text-xs text-gray-500 md:hidden mt-1">
                                    {formatDate(expense.date)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {formatCurrency(valorExibido)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <span 
                                  className="px-2 py-1 text-xs font-semibold rounded-full" 
                                  style={{ 
                                    backgroundColor: `${CATEGORY_COLORS[expense.category]}20`,
                                    color: CATEGORY_COLORS[expense.category]
                                  }}
                                >
                                  {CATEGORIES[expense.category]}
                                </span>
                              </td>
                              <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900">
                                {formatDate(expense.date)}
                              </td>
                              <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  expense.isFixed 
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {expense.isFixed ? 'Fixa' : 'Variável'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {Number(expense.installments) > 1 ? (
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    {currentInstallment}/{expense.installments}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                    À vista
                                  </span>
                                )}
                              </td>
                              {showPaymentStatus && (
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {expense.isPaid ? (
                                    <span className="inline-flex items-center text-green-600">
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      <span className="hidden md:inline">Pago</span>
                            </span>
                          ) : (
                                    <span className="inline-flex items-center text-red-600">
                                      <XCircle className="h-4 w-4 mr-1" />
                                      <span className="hidden md:inline">Pendente</span>
                                    </span>
                          )}
                        </td>
                              )}
                              <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center justify-end space-x-2">
                            {onTogglePayment && (
                              <button
                                onClick={() => onTogglePayment(expense.id, !expense.isPaid)}
                                className={`p-1 rounded-full transition-colors ${
                                  expense.isPaid 
                                    ? 'text-green-600 hover:bg-green-100' 
                                    : 'text-red-600 hover:bg-red-100'
                                }`}
                                disabled={disabled}
                              >
                                {expense.isPaid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={() => onEdit(expense)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                disabled={disabled}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(expense.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
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
              )}
            </div>
          )}
        </div>
          </div>

      {/* Vencimento Dia 15 */}
          <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Vencimento Dia 15</h2>
        <div className="space-y-4">
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
              <div key={cardName} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => toggleCard(`15-${cardName}`)}
                  style={{ borderLeft: `4px solid ${cardConfig.color}` }}
                >
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" style={{ color: cardConfig.color }} />
                    <span className="font-semibold" style={{ color: cardConfig.color }}>
                      {cardConfig.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({filteredExpenses.length} despesas)
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">{formatCurrency(cardTotalsByDueDay['15'][cardName])}</span>
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                          <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                          <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parcelas
                  </th>
                  {showPaymentStatus && (
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  )}
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                        {filteredExpenses.map((expense) => {
                    const currentInstallment = calculateCurrentInstallment(expense);
                          const valorExibido = Number(expense.amount);

                    return (
                      <tr key={expense.id} className={`hover:bg-gray-50 ${expense.isPaid ? 'bg-green-50' : ''}`}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex flex-col md:flex-row md:items-center">
                                  <span className="font-medium">{expense.description}</span>
                                  <span className="text-xs text-gray-500 md:hidden mt-1">
                                    {formatDate(expense.date)}
                                  </span>
                                </div>
                        </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {formatCurrency(valorExibido)}
                        </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                          <span 
                            className="px-2 py-1 text-xs font-semibold rounded-full" 
                            style={{ 
                              backgroundColor: `${CATEGORY_COLORS[expense.category]}20`,
                              color: CATEGORY_COLORS[expense.category]
                            }}
                          >
                            {CATEGORIES[expense.category]}
                          </span>
                        </td>
                              <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900">
                          {formatDate(expense.date)}
                        </td>
                              <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            expense.isFixed 
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {expense.isFixed ? 'Fixa' : 'Variável'}
                          </span>
                        </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                          {Number(expense.installments) > 1 ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {currentInstallment}/{expense.installments}
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              À vista
                            </span>
                          )}
                        </td>
                        {showPaymentStatus && (
                                <td className="px-4 py-3 text-sm text-gray-900">
                            {expense.isPaid ? (
                              <span className="inline-flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                      <span className="hidden md:inline">Pago</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-600">
                                <XCircle className="h-4 w-4 mr-1" />
                                      <span className="hidden md:inline">Pendente</span>
                              </span>
                            )}
                          </td>
                              )}
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex items-center justify-end space-x-2">
                                  {onTogglePayment && (
                                    <button
                                      onClick={() => onTogglePayment(expense.id, !expense.isPaid)}
                                      className={`p-1 rounded-full transition-colors ${
                                        expense.isPaid 
                                          ? 'text-green-600 hover:bg-green-100' 
                                          : 'text-red-600 hover:bg-red-100'
                                      }`}
                                      disabled={disabled}
                                    >
                                      {expense.isPaid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    </button>
                                  )}
                                  {onEdit && (
                                    <button
                                      onClick={() => onEdit(expense)}
                                      className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                      disabled={disabled}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                  )}
                                  {onDelete && (
                                    <button
                                      onClick={() => onDelete(expense.id)}
                                      className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
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
                )}
              </div>
            );
          })}

          {/* Outras despesas dia 15 */}
          {expensesByDueDayAndCard['15']['other'] && expensesByDueDayAndCard['15']['other'].length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                onClick={() => toggleCard('15-other')}
                style={{ borderLeft: '4px solid #718096' }}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-700">Outras Despesas</span>
                  <span className="text-sm text-gray-500">
                    ({expensesByDueDayAndCard['15']['other'].length} despesas)
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold">{formatCurrency(cardTotalsByDueDay['15']['other'])}</span>
                  {expandedCards['15-other'] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
              </div>

              {expandedCards['15-other'] && (
                <div className="border-t">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Parcelas
                        </th>
                        {showPaymentStatus && (
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        )}
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
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
                            <tr key={expense.id} className={`hover:bg-gray-50 ${expense.isPaid ? 'bg-green-50' : ''}`}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex flex-col md:flex-row md:items-center">
                                  <span className="font-medium">{expense.description}</span>
                                  <span className="text-xs text-gray-500 md:hidden mt-1">
                                    {formatDate(expense.date)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {formatCurrency(valorExibido)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <span 
                                  className="px-2 py-1 text-xs font-semibold rounded-full" 
                                  style={{ 
                                    backgroundColor: `${CATEGORY_COLORS[expense.category]}20`,
                                    color: CATEGORY_COLORS[expense.category]
                                  }}
                                >
                                  {CATEGORIES[expense.category]}
                                </span>
                              </td>
                              <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900">
                                {formatDate(expense.date)}
                              </td>
                              <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  expense.isFixed 
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {expense.isFixed ? 'Fixa' : 'Variável'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {Number(expense.installments) > 1 ? (
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    {currentInstallment}/{expense.installments}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                    À vista
                                  </span>
                                )}
                              </td>
                              {showPaymentStatus && (
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {expense.isPaid ? (
                                    <span className="inline-flex items-center text-green-600">
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      <span className="hidden md:inline">Pago</span>
                            </span>
                          ) : (
                                    <span className="inline-flex items-center text-red-600">
                                      <XCircle className="h-4 w-4 mr-1" />
                                      <span className="hidden md:inline">Pendente</span>
                                    </span>
                          )}
                        </td>
                              )}
                              <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center justify-end space-x-2">
                            {onTogglePayment && (
                              <button
                                onClick={() => onTogglePayment(expense.id, !expense.isPaid)}
                                className={`p-1 rounded-full transition-colors ${
                                  expense.isPaid 
                                    ? 'text-green-600 hover:bg-green-100' 
                                    : 'text-red-600 hover:bg-red-100'
                                }`}
                                disabled={disabled}
                              >
                                {expense.isPaid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={() => onEdit(expense)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                disabled={disabled}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(expense.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;