import { Link, useLocation } from 'react-router-dom';
import { Store, Package, ShoppingCart, PieChart, LogOut, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Store },
    { name: 'Produtos', href: '/products', icon: Package },
    { name: 'Vendas', href: '/sales', icon: ShoppingCart },
    { name: 'Relatórios', href: '/reports', icon: PieChart },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-full w-full bg-acai-primary text-white p-4 shadow-lg flex flex-col font-quicksand">
      {/* Header com logo e botão de fechar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Store className="h-8 w-8" />
          <span className="text-xl font-bold font-playfair">Mercadinho Açaí</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden text-white hover:text-gray-200 transition-colors p-2"
            aria-label="Fechar menu"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      
      {/* Links de navegação */}
      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-2 p-3 rounded-lg transition-colors duration-200 ${
                isActive(item.href)
                  ? 'bg-white/20'
                  : 'hover:bg-white/10'
              }`}
            >
              <Icon className="h-5 w-5 min-w-[20px]" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Botão de logout */}
      <button
        onClick={() => {
          if (onClose) onClose();
          signOut();
        }}
        className="mt-auto flex items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200 w-full"
      >
        <LogOut className="h-5 w-5 min-w-[20px]" />
        <span>Sair</span>
      </button>
    </div>
  );
}