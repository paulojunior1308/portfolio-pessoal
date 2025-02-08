import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, UserCheck as Cheese, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { items } = useCart();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="brand">
            <Cheese className="logo" />
            <span className="brand-text">JB Queijos</span>
          </Link>
          
          <div className="nav-links">
            <Link to="/catalog" className="nav-link">Produtos</Link>
            <Link to="/login" className="nav-link">
              <User className="icon" />
            </Link>
            <Link to="/cart" className="cart-link">
              <ShoppingCart className="icon" />
              {items.length > 0 && (
                <span className="cart-count">{items.length}</span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;