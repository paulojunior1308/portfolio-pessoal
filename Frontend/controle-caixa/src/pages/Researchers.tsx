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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-dark">Pesquisadores</h1>
        <button
          onClick={() => {
            setEditingResearcher(null);
            setFormData({ name: '', phone: '' });
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Pesquisador
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {researchers.map((researcher) => (
              <tr key={researcher.id}>
                <td className="px-6 py-4 whitespace-nowrap">{researcher.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{researcher.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleEdit(researcher)}
                    className="text-secondary hover:text-secondary/80 mr-3"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(researcher.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingResearcher ? 'Editar Pesquisador' : 'Novo Pesquisador'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
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