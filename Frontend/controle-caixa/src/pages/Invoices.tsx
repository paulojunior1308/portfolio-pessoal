import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import InvoiceModal from '../components/InvoiceModal';
import { Plus, Trash2, Edit } from 'lucide-react';
import { saveFile, getFile, deleteFile } from '../utils/fileStorage';

interface Invoice {
  id: string;
  number: string;
  date: string;
  value: number;
  description: string;
  fileId?: string;
  fileName?: string;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'invoices'));
      const invoicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Invoice[];
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSubmit = async (invoice: Omit<Invoice, 'id'> & { file?: File }) => {
    try {
      let fileId = invoice.fileId;
      let fileName = invoice.fileName;

      if (invoice.file) {
        // Salva o arquivo no IndexedDB
        fileId = await saveFile(invoice.file);
        fileName = invoice.file.name;
      }

      const invoiceData = {
        number: invoice.number,
        date: invoice.date,
        value: invoice.value,
        description: invoice.description,
        fileId,
        fileName,
        createdAt: new Date()
      };

      if (editingInvoice) {
        await updateDoc(doc(db, 'invoices', editingInvoice.id), invoiceData);
      } else {
        await addDoc(collection(db, 'invoices'), invoiceData);
      }
      setIsModalOpen(false);
      setEditingInvoice(null);
      fetchInvoices();
    } catch (error) {
      console.error('Erro ao salvar nota fiscal:', error);
    }
  };

  const handleDelete = async (id: string, fileId?: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
      try {
        // Se tiver arquivo anexado, deleta do IndexedDB
        if (fileId) {
          await deleteFile(fileId);
        }
        await deleteDoc(doc(db, 'invoices', id));
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

  const handleViewFile = async (fileId: string) => {
    try {
      const file = await getFile(fileId);
      if (file) {
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Erro ao abrir arquivo:', error);
    }
  };

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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anexo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {invoice.value.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {invoice.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.fileId ? (
                      <button
                        onClick={() => handleViewFile(invoice.fileId!)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {invoice.fileName || 'Visualizar'}
                      </button>
                    ) : (
                      'Sem anexo'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id, invoice.fileId)}
                        className="text-red-600 hover:text-red-900"
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
      </div>

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }}
        onSubmit={handleSubmit}
        editingInvoice={editingInvoice}
      />
    </div>
  );
} 