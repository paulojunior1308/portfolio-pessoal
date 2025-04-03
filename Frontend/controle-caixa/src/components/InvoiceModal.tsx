import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

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

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: Omit<Invoice, 'id'> & { file?: File }) => void;
  editingInvoice: Invoice | null;
  projects: Project[];
}

export default function InvoiceModal({ isOpen, onClose, onSubmit, editingInvoice, projects }: InvoiceModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      number: formData.get('number') as string,
      date: formData.get('date') as string,
      value: Number(formData.get('value')),
      description: formData.get('description') as string,
      projectId: formData.get('projectId') as string,
      file: formData.get('file') as File || undefined,
      fileId: editingInvoice?.fileId,
      fileName: editingInvoice?.fileName
    });
  };

  useEffect(() => {
    if (editingInvoice) {
      const form = document.getElementById('invoice-form') as HTMLFormElement;
      if (form) {
        form.number.value = editingInvoice.number;
        form.date.value = editingInvoice.date;
        form.value.value = editingInvoice.value;
        form.description.value = editingInvoice.description;
        form.projectId.value = editingInvoice.projectId || '';
      }
    }
  }, [editingInvoice]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  {editingInvoice ? 'Editar Nota Fiscal' : 'Cadastrar Nota Fiscal'}
                </Dialog.Title>
                <form id="invoice-form" onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="projectId" className="block text-gray-700 text-sm font-medium mb-1">
                      Projeto
                    </label>
                    <select
                      name="projectId"
                      id="projectId"
                      className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      <option value="">Selecione um projeto</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="number" className="block text-gray-700 text-sm font-medium mb-1">
                      Número da Nota
                    </label>
                    <input
                      type="text"
                      name="number"
                      id="number"
                      required
                      className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-gray-700 text-sm font-medium mb-1">
                      Data
                    </label>
                    <input
                      type="date"
                      name="date"
                      id="date"
                      required
                      className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="value" className="block text-gray-700 text-sm font-medium mb-1">
                      Valor
                    </label>
                    <input
                      type="number"
                      name="value"
                      id="value"
                      required
                      step="0.01"
                      className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-1">
                      Descrição
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      required
                      rows={3}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="file" className="block text-gray-700 text-sm font-medium mb-1">
                      Anexar Nota Fiscal
                    </label>
                    {editingInvoice?.fileName && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-600">
                          Arquivo atual: {editingInvoice.fileName}
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      name="file"
                      id="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Se não selecionar um novo arquivo, o arquivo atual será mantido.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      {editingInvoice ? 'Salvar' : 'Cadastrar'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 