import React, { useState } from 'react';
import { Expense, CATEGORIES, CategoryType, RecurrenceType, CREDIT_CARDS } from '../types';
import { PlusCircle, Loader2 } from 'lucide-react';

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  initialData?: Expense;
  buttonText?: string;
  disabled?: boolean;
  defaultMonth?: string;
}

interface FormData {
  description: string;
  amount: string;
  category: CategoryType;
  date: string;
  isFixed: boolean;
  installments: string;
  currentInstallment?: string;
  creditCard?: string;
  isPaid: boolean;
  recurrence: RecurrenceType;
  dueDay: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  onSubmit, 
  initialData, 
  buttonText = 'Adicionar Despesa',
  disabled = false,
  defaultMonth
}) => {
  const [formData, setFormData] = useState<FormData>({
    description: initialData?.description || '',
    amount: initialData?.amount.toString() || '',
    category: initialData?.category || 'diversos',
    date: initialData?.date || defaultMonth ? `${defaultMonth}-01` : new Date().toISOString().split('T')[0],
    isFixed: initialData?.isFixed || false,
    installments: initialData?.installments?.toString() || '1',
    currentInstallment: initialData?.currentInstallment?.toString() || '1',
    creditCard: initialData?.creditCard || '',
    isPaid: initialData?.isPaid || false,
    recurrence: initialData?.recurrence || 'monthly',
    dueDay: initialData?.dueDay?.toString() || '1'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (disabled) return;
    
    const expenseData: Omit<Expense, 'id'> = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      isFixed: formData.isFixed,
      installments: parseInt(formData.installments, 10),
      currentInstallment: formData.currentInstallment ? parseInt(formData.currentInstallment, 10) : undefined,
      creditCard: formData.creditCard,
      isPaid: formData.isPaid,
      recurrence: formData.recurrence,
      dueDay: formData.dueDay ? parseInt(formData.dueDay, 10) : undefined
    };
    
    onSubmit(expenseData);
    
    // Reset form if it's a new expense (not editing)
    if (!initialData) {
      setFormData({
        description: '',
        amount: '',
        category: 'diversos',
        date: defaultMonth ? `${defaultMonth}-01` : new Date().toISOString().split('T')[0],
        isFixed: false,
        installments: '1',
        currentInstallment: '1',
        creditCard: '',
        isPaid: false,
        recurrence: 'monthly',
        dueDay: '1'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077b6] disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="Ex: Aluguel, Mercado, etc."
        />
      </div>

      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Valor (R$)
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          disabled={disabled}
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077b6] disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="0.00"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Categoria
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0077b6] focus:ring-[#0077b6] sm:text-sm"
        >
          {Object.entries(CATEGORIES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="creditCard" className="block text-sm font-medium text-gray-700">
          Cartão de Crédito
        </label>
        <select
          id="creditCard"
          name="creditCard"
          value={formData.creditCard || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0077b6] focus:ring-[#0077b6] sm:text-sm"
        >
          <option value="">Selecione um cartão</option>
          {Object.entries(CREDIT_CARDS).map(([cardName, cardConfig]) => (
            <option key={cardName} value={cardName}>
              {cardConfig.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Data
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077b6] disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="dueDay" className="block text-sm font-medium text-gray-700">
          Dia de Vencimento
        </label>
        <select
          id="dueDay"
          name="dueDay"
          value={formData.dueDay}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0077b6] focus:ring-[#0077b6] sm:text-sm"
        >
          <option value="1">Dia 1º</option>
          <option value="15">Dia 15</option>
        </select>
      </div>

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="isFixed"
          name="isFixed"
          checked={formData.isFixed}
          onChange={handleChange}
          disabled={disabled}
          className="h-4 w-4 text-[#0077b6] focus:ring-[#0077b6] border-gray-300 rounded disabled:opacity-50"
        />
        <label htmlFor="isFixed" className="ml-2 block text-sm text-gray-700">
          Despesa Fixa
        </label>
      </div>

      {formData.isFixed && (
        <div className="mb-4">
          <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700">
            Recorrência
          </label>
          <select
            id="recurrence"
            name="recurrence"
            value={formData.recurrence}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0077b6] focus:ring-[#0077b6] sm:text-sm"
          >
            <option value="one-time">Única vez</option>
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="installments" className="block text-sm font-medium text-gray-700">
          Parcelas
        </label>
        <input
          type="number"
          id="installments"
          name="installments"
          min="1"
          value={formData.installments}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0077b6] focus:ring-[#0077b6] sm:text-sm"
        />
      </div>

      {Number(formData.installments) > 1 && (
        <div className="mb-4">
          <label htmlFor="currentInstallment" className="block text-sm font-medium text-gray-700">
            Parcela Atual
          </label>
          <input
            type="number"
            id="currentInstallment"
            name="currentInstallment"
            min="1"
            max={formData.installments}
            value={formData.currentInstallment || '1'}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0077b6] focus:ring-[#0077b6] sm:text-sm"
          />
        </div>
      )}

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="isPaid"
          name="isPaid"
          checked={formData.isPaid}
          onChange={handleChange}
          disabled={disabled}
          className="h-4 w-4 text-[#0077b6] focus:ring-[#0077b6] border-gray-300 rounded disabled:opacity-50"
        />
        <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-700">
          Despesa já paga
        </label>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full flex items-center justify-center px-4 py-2 bg-[#0077b6] text-white rounded-md hover:bg-[#005f92] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0077b6] disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {disabled ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-5 w-5" />
            {buttonText}
          </>
        )}
      </button>
    </form>
  );
};

export default ExpenseForm;