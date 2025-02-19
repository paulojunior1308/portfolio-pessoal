import { Link, useNavigate } from 'react-router-dom';
import { User, Menu, LogOut, Plus, Edit, CakeSlice, ShoppingCart, ShoppingBasket, ClipboardList } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState, useRef, useEffect } from 'react';
import { signOut } from '../lib/firebase/auth';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { cart, user, setUser, clearCart } = useStore();
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const navigate = useNavigate();

  const productsMenuRef = useRef<HTMLDivElement>(null);
  const authMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      clearCart();
      setShowAuthDropdown(false);
      setShowMobileMenu(false);
      setShowProductsMenu(false);
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout. Tente novamente.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productsMenuRef.current && !productsMenuRef.current.contains(event.target as Node)) {
        setShowProductsMenu(false);
      }
      if (authMenuRef.current && !authMenuRef.current.contains(event.target as Node)) {
        setShowAuthDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="font-playfair text-2xl text-wine flex items-center gap-2">
            <CakeSlice className="w-6 h-6" />
            Cida Confeitaria
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-soft-black hover:text-wine">
              Produtos
            </Link>

            {isAdmin && (
              <div className="relative" ref={productsMenuRef}>
                <button
                  onClick={() => setShowProductsMenu(!showProductsMenu)}
                  className="text-soft-black hover:text-wine flex items-center gap-2 bg-white px-3 py-1 rounded-md"
                >
                  Gerenciamento
                </button>

                {showProductsMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/admin/products/new"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProductsMenu(false)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Produto
                    </Link>
                    <Link
                      to="/admin/products"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProductsMenu(false)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Gerenciar Produtos
                    </Link>
                    <Link
                      to="/admin/orders"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProductsMenu(false)}
                    >
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Gerenciar Pedidos
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="relative" ref={authMenuRef}>
              <button
                onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                className="text-soft-black hover:text-wine"
              >
                <User className="w-6 h-6" />
              </button>

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
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-wine text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-4">
            {!isAdmin && (
              <Link to="/products" className="text-soft-black hover:text-wine">
                <ShoppingBasket className="w-6 h-6" />
              </Link>
            )}
            <Link to="/cart" className="relative text-soft-black hover:text-wine">
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-wine text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                className="text-soft-black hover:text-wine"
              >
                <User className="w-6 h-6" />
              </button>

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

            {isAdmin && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-soft-black hover:text-wine"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {isAdmin && showMobileMenu && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              <Link
                to="/products"
                className="block px-4 py-2 text-soft-black hover:bg-gray-100"
                onClick={() => setShowMobileMenu(false)}
              >
                Produtos
              </Link>
              <Link
                to="/admin/products/new"
                className="block px-4 py-2 text-soft-black hover:bg-gray-100"
                onClick={() => setShowMobileMenu(false)}
              >
                Novo Produto
              </Link>
              <Link
                to="/admin/products"
                className="block px-4 py-2 text-soft-black hover:bg-gray-100"
                onClick={() => setShowMobileMenu(false)}
              >
                Gerenciar Produtos
              </Link>
              <Link
                to="/admin/orders"
                className="block px-4 py-2 text-soft-black hover:bg-gray-100"
                onClick={() => setShowMobileMenu(false)}
              >
                Gerenciar Pedidos
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}