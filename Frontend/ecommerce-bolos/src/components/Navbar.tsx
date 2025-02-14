import { Link } from 'react-router-dom';
import { ShoppingBag, User, Menu, LogOut, CakeSlice } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState } from 'react';

export default function Navbar() {
  const { cart, user, setUser } = useStore();
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    setUser(null);
    setShowAuthDropdown(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="font-playfair text-2xl text-wine flex items-center gap-2">
            <CakeSlice className="w-6 h-6" />
            Cida Confeitaria
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-soft-black hover:text-wine font-bold">
              Produtos
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                className="text-soft-black hover:text-wine"
              >
                <User className="w-6 h-6" />
              </button>

              {/* Dropdown de Autenticação */}
              {showAuthDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowAuthDropdown(false)}
                      >
                        Meu Perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowAuthDropdown(false)}
                      >
                        Entrar
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowAuthDropdown(false)}
                      >
                        Cadastrar
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <Link to="/cart" className="relative text-soft-black hover:text-wine">
              <ShoppingBag className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-wine text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>

          <button className="md:hidden">
            <Menu className="w-6 h-6 text-soft-black" />
          </button>
        </div>
      </div>
    </nav>
  );
}