import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, Package, LogOut, Settings, Plus, Edit } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/config";
import "../styles/navbar.css";

function Navbar() {
  const { items } = useCart();
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProductMenu, setShowProductMenu] = useState(false);
  const menuRef = useRef(null);
  const productMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (productMenuRef.current && !productMenuRef.current.contains(event.target)) {
        setShowProductMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setShowProfileMenu(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="brand">
            <Package className="logo" />
            <span className="brand-text">JB Queijos</span>
          </Link>
          
          <div className="nav-links">
            <Link to="/catalog" className="nav-link">Produtos</Link>
            {user && user.role === 'ADMIN' && (
              <div className="product-management-container" ref={productMenuRef}>
                <button 
                  className="nav-link product-management-button"
                  onClick={() => setShowProductMenu(!showProductMenu)}
                >
                  <span>Gerenciar Produtos</span>
                </button>
                
                {showProductMenu && (
                  <div className="product-management-menu">
                    <Link to="/product-management" className="product-menu-item" onClick={() => setShowProductMenu(false)}>
                      <Plus size={16} />
                      <span>Cadastrar Produto</span>
                    </Link>
                    <Link to="/edit-products" className="product-menu-item" onClick={() => setShowProductMenu(false)}>
                      <Edit size={16} />
                      <span>Editar Produtos</span>
                    </Link>
                  </div>
                )}
              </div>
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
                  {/*} <Link to="/orders" className="profile-menu-item">
                    <ShoppingBag size={16} />
                    <span>Meus Pedidos</span>
                  </Link> */}
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
                    <User size={16} />
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