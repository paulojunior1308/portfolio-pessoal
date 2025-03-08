import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, serverTimestamp, FieldValue } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Expense, MonthlyReport, CategoryTotal, CreditCardTotal } from '../types';
import { format, parseISO, addMonths, isSameMonth, isSameYear, differenceInMonths } from 'date-fns';

const EXPENSES_COLLECTION = 'expenses';

type UpdateExpenseData = {
  description?: string;
  amount?: number;
  category?: string;
  date?: string;
  isFixed?: boolean;
  installments?: number;
  currentInstallment?: number;
  creditCard?: string;
  isPaid?: boolean;
  updatedAt?: FieldValue;
  dueDay?: number;
};


// Add a new expense
export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<string> => {
  try {
    const expenseData = {
      description: expense.description,
      amount: Number(expense.amount),
      category: expense.category,
      date: expense.date,
      isFixed: Boolean(expense.isFixed),
      installments: Number(expense.installments) || 1,
      currentInstallment: Number(expense.currentInstallment) || 1,
      recurrence: expense.recurrence || 'monthly',
      isPaid: Boolean(expense.isPaid) || false,
      creditCard: expense.creditCard || '',
      dueDay: expense.dueDay,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), expenseData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

// Get all expenses
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    console.log('Fetching all expenses from Firebase');
    const querySnapshot = await getDocs(collection(db, EXPENSES_COLLECTION));

    const expenses = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log('Raw expense data:', doc.id, data);

      return {
        id: doc.id,
        description: data.description || '',
        amount: Number(data.amount) || 0,
        category: data.category || 'diversos',
        date: data.date || new Date().toISOString().split('T')[0],
        isFixed: data.isFixed === true,
        recurrence: data.recurrence || 'monthly',
        installments: Number(data.installments) || 1,
        currentInstallment: Number(data.currentInstallment) || 1,
        isPaid: data.isPaid === true,
        creditCard: data.creditCard || '',
        dueDay: data.dueDay
      } as Expense;
    });

    console.log('Fetched expenses:', expenses.length);
    return expenses;
  } catch (error) {
    console.error('Error getting expenses: ', error);
    throw error;
  }
};

// Update an expense
export const updateExpense = async (id: string, expense: Partial<Expense>): Promise<void> => {
  try {
    const updateData: UpdateExpenseData = {
      updatedAt: serverTimestamp(),
    };

    if (expense.description !== undefined) updateData.description = expense.description;
    if (expense.amount !== undefined) updateData.amount = Number(expense.amount);
    if (expense.category !== undefined) updateData.category = expense.category;
    if (expense.date !== undefined) updateData.date = expense.date;
    if (expense.isFixed !== undefined) updateData.isFixed = Boolean(expense.isFixed);
    if (expense.installments !== undefined) updateData.installments = Number(expense.installments);
    if (expense.currentInstallment !== undefined) updateData.currentInstallment = Number(expense.currentInstallment);
    if (expense.isPaid !== undefined) updateData.isPaid = Boolean(expense.isPaid);
    if (expense.creditCard !== undefined) updateData.creditCard = expense.creditCard;
    if (expense.dueDay !== undefined) updateData.dueDay = expense.dueDay;

    await updateDoc(doc(db, EXPENSES_COLLECTION, id), updateData);
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

// Toggle payment status
export const togglePaymentStatus = async (id: string, isPaid: boolean): Promise<void> => {
  try {
    await updateDoc(doc(db, EXPENSES_COLLECTION, id), {
      isPaid: isPaid,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// Delete an expense
export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, EXPENSES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Check if a fixed expense applies to a specific month
export const isFixedExpenseApplicableInMonth = (expense: Expense, month: string): boolean => {
  const expenseDate = parseISO(expense.date);
  const targetDate = parseISO(`${month}-01`);
  
  if (expense.recurrence === 'one-time') {
    return format(expenseDate, 'yyyy-MM') === month;
  }
  
  if (expense.recurrence === 'yearly') {
    return expenseDate.getMonth() === targetDate.getMonth();
  }
  
  const monthsDiff = 
    (targetDate.getFullYear() - expenseDate.getFullYear()) * 12 + 
    (targetDate.getMonth() - expenseDate.getMonth());
    
  return monthsDiff >= 0;
};

// Manter apenas a função que está sendo utilizada
export const calculateInstallmentValue = (expense: Expense, targetMonth: string): number => {
  if (Number(expense.installments) <= 1) return 0;

  const targetDate = parseISO(`${targetMonth}-01`);
  const startDate = parseISO('2024-03-01');
  const monthsDiff = differenceInMonths(targetDate, startDate);
  
  const startingInstallment = expense.currentInstallment || 1;
  const remainingInstallments = Number(expense.installments) - startingInstallment + 1;
  
  if (monthsDiff >= 0 && monthsDiff < remainingInstallments) {
    return Number(expense.amount) / Number(expense.installments);
  }
  
  return 0;
};

// Gerar relatório mensal
export const generateMonthlyReport = (expenses: Expense[], month: string): MonthlyReport => {
  const expensesByCategory: Record<string, number> = {};
  const expensesByCreditCard: Record<string, number> = {};
  const expensesByDueDay: Record<string, number> = { '1': 0, '15': 0 };
  let totalExpenses = 0;
  let fixedExpenses = 0;
  let variableExpenses = 0;
  let installmentExpenses = 0;
  let paidExpenses = 0;
  let unpaidExpenses = 0;

  expenses.forEach(expense => {
    const targetDate = parseISO(`${month}-01`);
    const startDate = parseISO('2024-03-01');
    let amountToAdd = 0;

    // 1. Despesa simples (não parcelada)
    if (Number(expense.installments) <= 1) {
      const expenseDate = parseISO(expense.date);
      if (isSameMonth(expenseDate, targetDate) && isSameYear(expenseDate, targetDate)) {
        amountToAdd = Number(expense.amount);
      }
    } 
    // 2. Despesa parcelada
    else {
      const monthsDiff = differenceInMonths(targetDate, startDate);
      const startingInstallment = expense.currentInstallment || 1;
      const totalInstallments = Number(expense.installments);
      
      if (monthsDiff >= 0 && monthsDiff < (totalInstallments - startingInstallment + 1)) {
        amountToAdd = Number(expense.amount) / totalInstallments;
      }
    }

    // Se temos um valor para adicionar
    if (amountToAdd > 0) {
      // Adicionar ao total geral
      totalExpenses += amountToAdd;

      // Adicionar à categoria
      const category = expense.category;
      expensesByCategory[category] = (expensesByCategory[category] || 0) + amountToAdd;

      // Adicionar ao dia de vencimento
      const dueDay = expense.dueDay?.toString() || '1';
      expensesByDueDay[dueDay] = (expensesByDueDay[dueDay] || 0) + amountToAdd;

      // Se for despesa de cartão de crédito, adicionar ao total do cartão
      if (expense.creditCard) {
        expensesByCreditCard[expense.creditCard] = 
          (expensesByCreditCard[expense.creditCard] || 0) + amountToAdd;
      }

      // Atualizar totais por tipo
      if (expense.isFixed) {
        fixedExpenses += amountToAdd;
      } else if (Number(expense.installments) > 1) {
        installmentExpenses += amountToAdd;
      } else {
        variableExpenses += amountToAdd;
      }

      // Atualizar totais por status de pagamento
      if (expense.isPaid) {
        paidExpenses += amountToAdd;
      } else {
        unpaidExpenses += amountToAdd;
      }
    }
  });

  return {
    month,
    totalExpenses,
    fixedExpenses,
    variableExpenses,
    installmentExpenses,
    expensesByCategory,
    expensesByCreditCard,
    expensesByDueDay,
    paidExpenses,
    unpaidExpenses
  };
};

// Obter totais por categoria
export const getCategoryTotals = (expenses: Expense[], month: string): CategoryTotal[] => {
  const monthlyReport = generateMonthlyReport(expenses, month);
  const totalAmount = monthlyReport.totalExpenses || 0;

  if (!monthlyReport.expensesByCategory) {
    return [];
  }

  return Object.entries(monthlyReport.expensesByCategory)
    .map(([category, total]) => ({
      category,
      total,
      percentage: totalAmount > 0 ? (total / totalAmount) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total);
};

// Obter totais por cartão de crédito
export const getCreditCardTotals = (expenses: Expense[], month: string): CreditCardTotal[] => {
  // Inicializar totais por cartão
  const creditCardTotals: Record<string, number> = {};

  // Processar cada despesa
  expenses.forEach(expense => {
    // Ignorar despesas sem cartão
    if (!expense.creditCard) return;

    const expenseDate = parseISO(expense.date);
    const targetDate = parseISO(`${month}-01`);

    // Se for despesa do mês atual (não parcelada)
    if (Number(expense.installments) <= 1) {
      if (isSameMonth(expenseDate, targetDate) && isSameYear(expenseDate, targetDate)) {
        creditCardTotals[expense.creditCard] = (creditCardTotals[expense.creditCard] || 0) + Number(expense.amount);
      }
    } 
    // Se for despesa parcelada
    else {
      const monthsDiff = differenceInMonths(targetDate, expenseDate);
      const startingInstallment = expense.currentInstallment || 1;
      const totalInstallments = Number(expense.installments);
      
      if (monthsDiff >= 0 && monthsDiff < (totalInstallments - startingInstallment + 1)) {
        const installmentValue = Number(expense.amount) / totalInstallments;
        creditCardTotals[expense.creditCard] = (creditCardTotals[expense.creditCard] || 0) + installmentValue;
      }
    }
  });

  // Calcular o total geral
  const totalAmount = Object.values(creditCardTotals).reduce((sum, value) => sum + value, 0);

  // Formatar resultado
  return Object.entries(creditCardTotals).map(([creditCard, total]) => ({
    creditCard,
    total,
    percentage: totalAmount > 0 ? (total / totalAmount) * 100 : 0
  })).sort((a, b) => b.total - a.total);
};

// Gerar previsão financeira
export const generateFinancialForecast = (expenses: Expense[], startMonth: string): Record<string, { 
  fixed: number; 
  installments: number; 
  total: number;
  paid: number;
  unpaid: number;
}> => {
  const forecast: Record<string, { 
    fixed: number; 
    installments: number; 
    total: number;
    paid: number;
    unpaid: number;
  }> = {};

  // Gerar previsão para os próximos 12 meses
  for (let i = 0; i < 12; i++) {
    const currentDate = addMonths(parseISO(`${startMonth}-01`), i);
    const currentMonth = format(currentDate, 'yyyy-MM');
    
    forecast[currentMonth] = {
      fixed: 0,
      installments: 0,
      total: 0,
      paid: 0,
      unpaid: 0
    };

    expenses.forEach(expense => {
      let amount = 0;

      if (expense.isFixed) {
        if (isFixedExpenseApplicableInMonth(expense, currentMonth)) {
          amount = expense.amount;
          forecast[currentMonth].fixed += amount;
        }
      } else if (Number(expense.installments) > 1) {
        amount = calculateInstallmentValue(expense, currentMonth);
        if (amount > 0) {
          forecast[currentMonth].installments += amount;
        }
      } else {
        const expenseDate = parseISO(expense.date);
        if (isSameMonth(expenseDate, currentDate) && isSameYear(expenseDate, currentDate)) {
          amount = expense.amount;
          forecast[currentMonth].fixed += amount;
        }
      }

      if (amount > 0) {
        forecast[currentMonth].total += amount;
        if (expense.isPaid) {
          forecast[currentMonth].paid += amount;
        } else {
          forecast[currentMonth].unpaid += amount;
        }
      }
    });
  }

  return forecast;
};

export const calculateMonthlyBalance = (salary: number, totalExpenses: number): number => {
  return Number(salary) - totalExpenses;
};