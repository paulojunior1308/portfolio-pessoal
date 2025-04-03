import { useState, useEffect, Fragment } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';
import { saveFile, getFile, deleteFile } from '../utils/fileStorage';

interface Project {
  id: string;
  name: string;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  value: number;
  description: string;
  fileId?: string;
  fileName?: string;
  projectId?: string;
  projectName?: string;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsList);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'invoices'));
      const invoicesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Invoice[];
      setInvoices(invoicesList);
    } catch (error) {
      console.error('Erro ao buscar notas fiscais:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchProjects();
  }, []);

  const handleSubmit = async (invoiceData: Omit<Invoice, 'id'> & { file?: File }) => {
    try {
      let fileId = invoiceData.fileId;
      let fileName = invoiceData.fileName;

      if (invoiceData.file) {
        fileId = await saveFile(invoiceData.file);
        fileName = invoiceData.file.name;
      }

      const project = projects.find(p => p.id === invoiceData.projectId);
      
      // Cria um novo objeto sem o campo file
      const invoiceToSave = {
        number: invoiceData.number,
        date: invoiceData.date,
        value: invoiceData.value,
        description: invoiceData.description,
        projectId: invoiceData.projectId,
        fileId,
        fileName,
        projectName: project?.name
      };

      if (editingInvoice) {
        await updateDoc(doc(db, 'invoices', editingInvoice.id), invoiceToSave);
      } else {
        await addDoc(collection(db, 'invoices'), invoiceToSave);
      }

      fetchInvoices();
      setIsModalOpen(false);
      setEditingInvoice(null);
    } catch (error) {
      console.error('Erro ao salvar nota fiscal:', error);
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    if (confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
      try {
        if (invoice.fileId) {
          await deleteFile(invoice.fileId);
        }
        await deleteDoc(doc(db, 'invoices', invoice.id));
        fetchInvoices();
      } catch (error) {
        console.error('Erro ao excluir nota fiscal:', error);
      }
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleViewFile = async (invoice: Invoice) => {
    if (invoice.fileId) {
      try {
        const file = await getFile(invoice.fileId);
        if (file) {
          const url = URL.createObjectURL(file);
          window.open(url, '_blank');
        }
      } catch (error) {
        console.error('Erro ao visualizar arquivo:', error);
      }
    }
  };

  const groupedInvoices = invoices.reduce((acc, invoice) => {
    const projectId = invoice.projectId || 'Sem Projeto';
    if (!acc[projectId]) {
      acc[projectId] = {
        name: invoice.projectName || 'Sem Projeto',
        invoices: []
      };
    }
    acc[projectId].invoices.push(invoice);
    return acc;
  }, {} as Record<string, { name: string; invoices: Invoice[] }>);

  if (loading) {
    return (
      <div className="p-4 max-w-[1366px] mx-auto min-h-screen">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[1366px] mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-dark">Notas Fiscais</h1>
        <button
          onClick={() => {
            setEditingInvoice(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto bg-primary text-white px-3 py-2 rounded-md flex items-center justify-center sm:justify-start text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Nota Fiscal
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projeto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade de Notas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(groupedInvoices).map(([projectId, { name, invoices: projectInvoices }]) => (
                <Fragment key={projectId}>
                  <tr 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedProject(expandedProject === projectId ? null : projectId)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {projectInvoices.length} nota(s) fiscal(is)
                    </td>
                  </tr>
                  {expandedProject === projectId && (
                    <tr>
                      <td colSpan={2} className="px-6 py-4">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Número
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Data
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Valor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Descrição
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ações
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {projectInvoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {invoice.number}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(invoice.date).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    R$ {invoice.value.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {invoice.description}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                      {invoice.fileName && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewFile(invoice);
                                          }}
                                          className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                                          title="Visualizar arquivo"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEdit(invoice);
                                        }}
                                        className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                                        title="Editar nota fiscal"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(invoice);
                                        }}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Excluir nota fiscal"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }}
        onSubmit={handleSubmit}
        editingInvoice={editingInvoice}
        projects={projects}
      />
    </div>
  );
} 