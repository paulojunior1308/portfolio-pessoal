import { useState, useEffect } from 'react';
import Header from './components/Header';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Dashboard from './components/Dashboard';
import EditExpenseModal from './components/EditExpenseModal';
import { Expense } from './types';
import { addExpense, getExpenses, updateExpense, deleteExpense, togglePaymentStatus } from './services/expenseService';
import { AlertTriangle, Loader2 } from 'lucide-react';
import SalaryForm from './components/SalaryForm';
import { format, parseISO, differenceInMonths } from 'date-fns';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [salary, setSalary] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    fetchExpenses();
    // Load salary from localStorage on mount
    const savedSalary = localStorage.getItem('userSalary');
    if (savedSalary) {
      setSalary(parseFloat(savedSalary));
    }
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      console.log('Fetching expenses...');
      const data = await getExpenses();
      console.log('Fetched expenses:', data.length);
      setExpenses(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Erro ao carregar despesas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      setSubmitting(true);
      console.log('Adding expense:', expense);
      
      // Ensure isFixed is a boolean
      const expenseToAdd = {
        ...expense,
        isFixed: Boolean(expense.isFixed),
        isPaid: Boolean(expense.isPaid)
      };
      
      const id = await addExpense(expenseToAdd);
      console.log('Expense added with ID:', id);
      
      // Add the new expense to the state
      setExpenses(prev => [...prev, { id, ...expenseToAdd }]);
      setError(null);
      
      // Show success message
      alert('Despesa adicionada com sucesso!');
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Erro ao adicionar despesa. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleSaveEdit = async (updatedExpense: Omit<Expense, 'id'>) => {
    if (!editingExpense) return;
    
    try {
      setSubmitting(true);
      console.log('Updating expense:', editingExpense.id, updatedExpense);
      
      // Ensure isFixed is a boolean
      const expenseToUpdate = {
        ...updatedExpense,
        isFixed: Boolean(updatedExpense.isFixed),
        isPaid: Boolean(updatedExpense.isPaid)
      };
      
      await updateExpense(editingExpense.id, expenseToUpdate);
      
      // Update the expense in the state
      setExpenses(prev => 
        prev.map(exp => 
          exp.id === editingExpense.id 
            ? { ...expenseToUpdate, id: editingExpense.id } 
            : exp
        )
      );
      
      setEditingExpense(null);
      setError(null);
      
      // Show success message
      alert('Despesa atualizada com sucesso!');
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Erro ao atualizar despesa. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;
    
    try {
      setSubmitting(true);
      console.log('Deleting expense:', id);
      await deleteExpense(id);
      
      // Remove the expense from the state
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      setError(null);
      
      // Show success message
      alert('Despesa excluída com sucesso!');
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Erro ao excluir despesa. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePayment = async (id: string, isPaid: boolean) => {
    try {
      setSubmitting(true);
      console.log('Toggling payment status:', id, isPaid);
      await togglePaymentStatus(id, isPaid);
      
      // Update the expense in the state
      setExpenses(prev => 
        prev.map(exp => 
          exp.id === id 
            ? { ...exp, isPaid } 
            : exp
        )
      );
      
      setError(null);
    } catch (err) {
      console.error('Error toggling payment status:', err);
      setError('Erro ao atualizar status de pagamento. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSalary = (newSalary: number) => {
    setSalary(newSalary);
    localStorage.setItem('userSalary', newSalary.toString());
  };

  // Filter expenses for the selected month
  const filterExpensesForMonth = (expenses: Expense[], selectedMonth: string) => {
    return expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      const targetDate = parseISO(`${selectedMonth}-01`);
      
      // Sempre incluir despesas fixas
      if (expense.isFixed) {
        const monthDiff = differenceInMonths(targetDate, expenseDate);
        return monthDiff >= 0;
      }
      
      // Para despesas parceladas
      if (Number(expense.installments) > 1) {
        const monthDiff = differenceInMonths(targetDate, expenseDate);
        const startingInstallment = expense.currentInstallment || 1;
        const remainingInstallments = Number(expense.installments) - startingInstallment + 1;
        
        // Só mostrar se ainda houver parcelas a serem pagas
        return monthDiff >= 0 && monthDiff < remainingInstallments;
      }
      
      // Para despesas normais (não fixas e não parceladas)
      return format(expenseDate, 'yyyy-MM') === selectedMonth;
    });
  };

  const filteredExpenses = filterExpensesForMonth(expenses, selectedMonth);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {activeTab === 'dashboard' ? (
          <>
            <div className="mb-6">
              <SalaryForm onSave={handleSaveSalary} initialSalary={salary} />
            </div>
            <Dashboard 
              expenses={expenses} 
              salary={salary}
            />
          </>
        ) : (
          <div className="space-y-6">
            {/* Month selector for expenses tab */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <label htmlFor="expense-month" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar despesas por mês
              </label>
              <input
                type="month"
                id="expense-month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Adicionar Despesa</h2>
                <ExpenseForm 
                  onSubmit={handleAddExpense} 
                  disabled={submitting}
                  defaultMonth={selectedMonth}
                />
                {submitting && (
                  <div className="mt-4 flex items-center justify-center text-gray-600">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    <span>Processando...</span>
                  </div>
                )}
              </div>
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Lista de Despesas</h2>
                {loading ? (
                  <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-[#0077b6] animate-spin" />
                      <span className="ml-2 text-gray-500">Carregando despesas...</span>
                    </div>
                  </div>
                ) : (
                  <ExpenseList 
                    expenses={filteredExpenses}
                    onEdit={handleEditExpense} 
                    onDelete={handleDeleteExpense}
                    onTogglePayment={handleTogglePayment}
                    disabled={submitting}
                    selectedMonth={selectedMonth}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {editingExpense && (
        <EditExpenseModal 
          expense={editingExpense} 
          onSave={handleSaveEdit} 
          onCancel={() => setEditingExpense(null)} 
          disabled={submitting}
        />
      )}
    </div>
  );
}

export default App;