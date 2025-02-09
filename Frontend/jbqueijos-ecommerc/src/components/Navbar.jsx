import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Pizza, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { items } = useCart();
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="brand">
            <Pizza className="logo" />
            <span className="brand-text">JB Queijos</span>
          </Link>
          
          <div className="nav-links">
            <Link to="/catalog" className="nav-link">Produtos</Link>
            {user && user.role === 'ADMIN' && (
              <Link to="/product-management" className="nav-link">
                <span>Gerenciar Produtos</span>
              </Link>
            )}
            <Link to={user ? '/login' : '/login'} className="nav-link">
              <User className="icon" />
            </Link>
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