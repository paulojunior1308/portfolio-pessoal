import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<Category, 'id'> & { id?: string }>({
    name: '',
    description: '',
    color: '#4A90E2'
  });

  const fetchCategories = async () => {
    try {
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        const categoryRef = doc(db, 'categories', formData.id);
        const { ...updateData } = formData;
        delete updateData.id;
        await updateDoc(categoryRef, updateData);
      } else {
        const { ...newData } = formData;
        delete newData.id;
        await addDoc(collection(db, 'categories'), newData);
      }
      
      setShowForm(false);
      setIsEditing(false);
      setFormData({
        name: '',
        description: '',
        color: '#4A90E2'
      });
      fetchCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        fetchCategories();
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
      }
    }
  };

  const handleEdit = (category: Category) => {
    setFormData(category);
    setIsEditing(true);
    setShowForm(true);
  };

  if (loading) {
    return <div className="text-center">Carregando...</div>;
  }

  return (
    <div className="p-4 max-w-[1366px] mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-dark">Categorias</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setFormData({
              name: '',
              description: '',
              color: '#4A90E2'
            });
            setShowForm(true);
          }}
          className="w-full sm:w-auto bg-primary text-white px-3 py-2 rounded-md flex items-center justify-center sm:justify-start text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cor</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                      {category.name}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {category.description || '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {category.color}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-secondary hover:text-secondary/80 mr-2"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
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
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Cor
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  {isEditing ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 