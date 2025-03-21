import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Expense {
  id: string;
  name: string;
  projectId: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

interface Project {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    amount: '',
    category: '',
    description: '',
    date: ''
  });

  const fetchData = async () => {
    try {
      const [expensesSnapshot, projectsSnapshot, categoriesSnapshot] = await Promise.all([
        getDocs(collection(db, 'expenses')),
        getDocs(collection(db, 'projects')),
        getDocs(collection(db, 'categories'))
      ]);

      const expensesData = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.split('T')[0]
      })) as Expense[];

      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));

      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];

      setExpenses(expensesData);
      setProjects(projectsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        createdAt: new Date()
      };

      if (editingExpense) {
        await updateDoc(doc(db, 'expenses', editingExpense.id), expenseData);
      } else {
        await addDoc(collection(db, 'expenses'), expenseData);
      }
      setIsModalOpen(false);
      setEditingExpense(null);
      setFormData({
        name: '',
        projectId: '',
        amount: '',
        category: '',
        description: '',
        date: ''
      });
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await deleteDoc(doc(db, 'expenses', id));
        fetchData();
      } catch (error) {
        console.error('Erro ao excluir despesa:', error);
      }
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      projectId: expense.projectId,
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || '',
      date: expense.date
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center">Carregando...</div>;
  }

  return (
    <div className="p-4 max-w-[1366px] mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-dark">Despesas</h1>
        <button
          onClick={() => {
            setEditingExpense(null);
            setFormData({
              name: '',
              amount: '',
              category: '',
              projectId: '',
              date: '',
              description: ''
            });
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto bg-primary text-white px-3 py-2 rounded-md flex items-center justify-center sm:justify-start text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => {
                const category = categories.find(c => c.name === expense.category);
                return (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <div>
                        {expense.name}
                        {expense.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{expense.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {projects.find(p => p.id === expense.projectId)?.name || '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {category && (
                          <span 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: category.color || '#4A90E2' }} 
                          />
                        )}
                        {expense.category}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                      R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                      {expense.date ? new Date(expense.date).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-secondary hover:text-secondary/80 mr-2"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Projeto
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                >
                  <option value="">Selecione um projeto</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  {editingExpense ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}