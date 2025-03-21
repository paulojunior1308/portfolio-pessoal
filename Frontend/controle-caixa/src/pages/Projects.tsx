import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trash2, Edit, Plus } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  totalAmount: number;
  researcherId: string;
}

interface Researcher {
  id: string;
  name: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    researcherId: ''
  });

  const fetchData = async () => {
    try {
      const [projectsSnapshot, researchersSnapshot] = await Promise.all([
        getDocs(collection(db, 'projects')),
        getDocs(collection(db, 'researchers'))
      ]);

      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];

      const researchersData = researchersSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));

      setProjects(projectsData);
      setResearchers(researchersData);
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
      const projectData = {
        ...formData,
        totalAmount: parseFloat(formData.totalAmount),
        createdAt: new Date()
      };

      if (editingProject) {
        await updateDoc(doc(db, 'projects', editingProject.id), projectData);
      } else {
        await addDoc(collection(db, 'projects'), projectData);
      }
      setIsModalOpen(false);
      setEditingProject(null);
      setFormData({ name: '', totalAmount: '', researcherId: '' });
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        fetchData();
      } catch (error) {
        console.error('Erro ao excluir projeto:', error);
      }
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      totalAmount: project.totalAmount.toString(),
      researcherId: project.researcherId
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center">Carregando...</div>;
  }

  return (
    <div className="p-4 max-w-[1366px] mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-dark">Projetos</h1>
        <button
          onClick={() => {
            setEditingProject(null);
            setFormData({
              name: '',
              totalAmount: '',
              researcherId: ''
            });
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto bg-primary text-white px-3 py-2 rounded-md flex items-center justify-center sm:justify-start text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pesquisador</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{project.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {researchers.find(r => r.id === project.researcherId)?.name || '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    R$ {project.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-secondary hover:text-secondary/80 mr-2"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
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
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
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
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Pesquisador
                </label>
                <select
                  value={formData.researcherId}
                  onChange={(e) => setFormData({ ...formData, researcherId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                >
                  <option value="">Selecione um pesquisador</option>
                  {researchers.map((researcher) => (
                    <option key={researcher.id} value={researcher.id}>
                      {researcher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Valor Total
                </label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                  min="0"
                  step="0.01"
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