import React from 'react';
import { Expense } from '../types';
import ExpenseForm from './ExpenseForm';

interface EditExpenseModalProps {
  expense: Expense;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
  disabled?: boolean;
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({ expense, onSave, onCancel, disabled = false }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Editar Despesa</h2>
        </div>
        <div className="p-4">
          <ExpenseForm 
            onSubmit={onSave} 
            initialData={expense} 
            buttonText="Salvar Alterações" 
            disabled={disabled}
          />
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onCancel}
            disabled={disabled}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 focus:outline-none disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;