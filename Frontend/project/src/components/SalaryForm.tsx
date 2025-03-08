import React, { useState } from 'react';

interface SalaryFormProps {
  onSave: (salary: number) => void;
  initialSalary?: number;
}

const SalaryForm: React.FC<SalaryFormProps> = ({ onSave, initialSalary = 0 }) => {
  const [salary, setSalary] = useState(initialSalary);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(salary);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
          Salário Mensal (R$)
        </label>
        <input
          type="number"
          id="salary"
          value={salary}
          onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
          placeholder="0.00"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-[#0077b6] text-white py-2 px-4 rounded-md hover:bg-[#005f8d] focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:ring-offset-2"
      >
        Salvar Salário
      </button>
    </form>
  );
};

export default SalaryForm; 