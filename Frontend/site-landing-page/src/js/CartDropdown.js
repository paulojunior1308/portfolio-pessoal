import React from 'react';
import { useCart } from '../js/Cart';
import { Link } from 'react-router-dom';
import '../css/CartDropdown.css';

export function CartDropdown({ isOpen }) {
  const { cartItems, getCartTotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="cart-dropdown">
      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item.id} className="cart-item">
            <img 
              src={item.images[0]} 
              alt={item.nome} 
              className="cart-item-image"
            />
            <div className="cart-item-info">
              <h4 className="cart-item-title">{item.nome}</h4>
              <div className="cart-item-details">
                <span className="cart-item-quantity">Qtd: {item.quantity}</span>
                <span className="cart-item-price">
                  R$ {(item.preco * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-footer">
        <div className="cart-total">
          <span>Total</span>
          <span>R$ {getCartTotal().toFixed(2)}</span>
        </div>
        <Link to="/checkout" className="checkout-button">
          Continuar para pagamento
        </Link>
      </div>
    </div>
  );
}