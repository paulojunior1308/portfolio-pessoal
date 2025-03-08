import React from 'react';
import { BarChart3, DollarSign, PlusCircle, Menu } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-[#0077b6] text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 mr-2" />
              <h1 className="text-xl md:text-2xl font-bold">Controle Financeiro Pessoal</h1>
            </div>
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <button
                onClick={() => {
                  onTabChange('dashboard');
                  setIsMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-md flex items-center justify-center md:justify-start ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-[#0077b6] font-medium'
                    : 'text-white hover:bg-[#00b4d8] hover:bg-opacity-30'
                }`}
              >
                <BarChart3 className="h-5 w-5 mr-1" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => {
                  onTabChange('expenses');
                  setIsMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-md flex items-center justify-center md:justify-start ${
                  activeTab === 'expenses'
                    ? 'bg-white text-[#0077b6] font-medium'
                    : 'text-white hover:bg-[#00b4d8] hover:bg-opacity-30'
                }`}
              >
                <PlusCircle className="h-5 w-5 mr-1" />
                <span>Despesas</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;