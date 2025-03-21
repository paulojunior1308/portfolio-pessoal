import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trash2, Edit, Plus } from 'lucide-react';

interface Researcher {
  id: string;
  name: string;
  phone: string;
}

export default function Researchers() {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResearcher, setEditingResearcher] = useState<Researcher | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  const fetchResearchers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'researchers'));
      const researchersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Researcher[];
      setResearchers(researchersData);
    } catch (error) {
      console.error('Erro ao carregar pesquisadores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearchers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingResearcher) {
        await updateDoc(doc(db, 'researchers', editingResearcher.id), formData);
      } else {
        await addDoc(collection(db, 'researchers'), formData);
      }
      setIsModalOpen(false);
      setEditingResearcher(null);
      setFormData({ name: '', phone: '' });
      fetchResearchers();
    } catch (error) {
      console.error('Erro ao salvar pesquisador:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pesquisador?')) {
      try {
        await deleteDoc(doc(db, 'researchers', id));
        fetchResearchers();
      } catch (error) {
        console.error('Erro ao excluir pesquisador:', error);
      }
    }
  };

  const handleEdit = (researcher: Researcher) => {
    setEditingResearcher(researcher);
    setFormData({
      name: researcher.name,
      phone: researcher.phone
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center">Carregando...</div>;
  }

  return (
    <div className="p-4 max-w-[1366px] mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-dark">Pesquisadores</h1>
        <button
          onClick={() => {
            setEditingResearcher(null);
            setFormData({ name: '', phone: '' });
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto bg-primary text-white px-3 py-2 rounded-md flex items-center justify-center sm:justify-start text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Pesquisador
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {researchers.map((researcher) => (
                <tr key={researcher.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{researcher.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{researcher.phone}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleEdit(researcher)}
                      className="text-secondary hover:text-secondary/80 mr-2"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(researcher.id)}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              {editingResearcher ? 'Editar Pesquisador' : 'Novo Pesquisador'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
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
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                  placeholder="(00) 00000-0000"
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}