import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, UserCheck, LogOut, Settings, ShoppingBag, Pizza, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import '../styles/navbar.css';

const Navbar = () => {
  const { items } = useCart();
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)){
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  } , []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setShowProfileMenu(false);
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout: ", error);
    }
  };

  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="brand">
            <Pizza className="logo" />
            <span className="brand-text">JB Frios e Laticínios</span>
          </Link>
          
          <div className="nav-links">
            <Link to="/catalog" className="nav-link">Produtos</Link>
            {user && user.role === 'ADMIN' && (
              <Link to="/product-management" className="nav-link">
                <span>Gerenciar Produtos</span>
              </Link>
            )}
            <div className="profile-container" ref={menuRef}>
              <button 
                className="profile-button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <User className="icon" />
                {user && <span className="profile-name">{user.companyName}</span>}
              </button>
              
              {showProfileMenu && user && (
                <div className="profile-menu">
                  <Link to="/profile" className="profile-menu-item">
                    <Settings size={16} />
                    <span>Minha Conta</span>
                  </Link>
                  <Link to="/orders" className="profile-menu-item">
                    <ShoppingBag size={16} />
                    <span>Meus Pedidos</span>
                  </Link>
                  <button onClick={handleLogout} className="profile-menu-item logout">
                    <LogOut size={16} />
                    <span>Sair</span>
                  </button>
                </div>
              )}
              
              {showProfileMenu && !user && (
                <div className="profile-menu">
                  <Link to="/login" className="profile-menu-item">
                    <User size={16} />
                    <span>Entrar</span>
                  </Link>
                  <Link to="/register" className="profile-menu-item">
                    <UserCheck size={16} />
                    <span>Cadastrar</span>
                  </Link>
                </div>
              )}
            </div>
            {user && user.role === 'CLIENT' && (
              <Link to="/cart" className="cart-link">
                <ShoppingCart className="icon" />
                {items.length > 0 && (
                  <span className="cart-count">{items.length}</span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;