import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trash2, Edit, Plus, X } from 'lucide-react';

interface Contract {
  id: string;
  contractNumber: string;
  objective: string;
  companyName: string;
  companyCnpj: string;
  researcherId: string;
  startDate: string;
  endDate: string;
  value: number;
  isInnovation: boolean;
}

interface Researcher {
  id: string;
  name: string;
}

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<Omit<Contract, 'id'> & { id?: string }>({
    contractNumber: '',
    objective: '',
    companyName: '',
    companyCnpj: '',
    researcherId: '',
    startDate: '',
    endDate: '',
    value: 0,
    isInnovation: false,
  });

  const fetchResearchers = async () => {
    try {
      const researchersSnapshot = await getDocs(collection(db, 'researchers'));
      const researchersData = researchersSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setResearchers(researchersData);
      return researchersData;
    } catch (error) {
      console.error('Erro ao carregar pesquisadores:', error);
      return [];
    }
  };

  const fetchContracts = async () => {
    try {
      const contractsSnapshot = await getDocs(collection(db, 'contracts'));
      const contractsData = contractsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contract[];
      setContracts(contractsData);
      return contractsData;
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchResearchers(),
        fetchContracts()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        const contractRef = doc(db, 'contracts', formData.id);
        const { ...updateData } = formData;
        delete updateData.id;
        await updateDoc(contractRef, updateData);
      } else {
        const { ...newData } = formData;
        delete newData.id;
        await addDoc(collection(db, 'contracts'), newData);
      }
      
      setShowForm(false);
      setIsEditing(false);
      setFormData({
        contractNumber: '',
        objective: '',
        companyName: '',
        companyCnpj: '',
        researcherId: '',
        startDate: '',
        endDate: '',
        value: 0,
        isInnovation: false,
      });
      fetchContracts();
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        await deleteDoc(doc(db, 'contracts', id));
        fetchContracts();
      } catch (error) {
        console.error('Erro ao excluir contrato:', error);
      }
    }
  };

  const handleEdit = (contract: Contract) => {
    setFormData(contract);
    setIsEditing(true);
    setShowForm(true);
  };

  if (loading) {
    return <div className="text-center">Carregando...</div>;
  }

  return (
    <div className="p-4 max-w-[1366px] mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-dark">Contratos</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setShowForm(true);
            setFormData({
              contractNumber: '',
              objective: '',
              companyName: '',
              companyCnpj: '',
              researcherId: '',
              startDate: '',
              endDate: '',
              value: 0,
              isInnovation: false,
            });
          }}
          className="w-full sm:w-auto bg-primary text-white px-3 py-2 rounded-md flex items-center justify-center sm:justify-start text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th className="hidden sm:table-cell px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="hidden lg:table-cell px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
                <th className="hidden md:table-cell px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pesquisador</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="hidden sm:table-cell px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                <th className="hidden md:table-cell px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((contract) => {
                const researcher = researchers.find(r => r.id === contract.researcherId);
                return (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <div>
                        <span>{contract.contractNumber}</span>
                        <div className="sm:hidden text-xs text-gray-500 mt-1">
                          {contract.companyName}
                        </div>
                        <div className="md:hidden text-xs text-gray-500 mt-0.5">
                          {researcher?.name}
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-2 whitespace-nowrap text-sm">
                      {contract.companyName}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-2 whitespace-nowrap text-sm">
                      {contract.companyCnpj}
                    </td>
                    <td className="hidden md:table-cell px-4 py-2 whitespace-nowrap text-sm">
                      {researcher?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                      R$ {contract.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-2 whitespace-nowrap text-sm text-right">
                      {new Date(contract.startDate).toLocaleDateString('pt-BR')} - {new Date(contract.endDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="hidden md:table-cell px-4 py-2 whitespace-nowrap text-sm text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contract.isInnovation
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {contract.isInnovation ? 'Inovação' : 'Regular'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleEdit(contract)}
                        className="text-secondary hover:text-secondary/80 mr-2"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contract.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Excluir"
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

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {isEditing ? 'Editar Contrato' : 'Novo Contrato'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Número do Contrato
                  </label>
                  <input
                    type="text"
                    value={formData.contractNumber}
                    onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div>
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

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={formData.companyCnpj}
                    onChange={(e) => setFormData({ ...formData, companyCnpj: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isInnovation}
                      onChange={(e) => setFormData({ ...formData, isInnovation: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                    />
                    <span className="ml-2 text-sm text-gray-700">Contrato de Inovação</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Objetivo
                </label>
                <textarea
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
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