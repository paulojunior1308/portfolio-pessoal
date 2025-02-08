import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';
import '../styles/Cart.css';

function Cart() {
  const { items, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="carrinho-vazio">
        <h2 className="carrinho-vazio-title">Seu carrinho está vazio</h2>
        <button
          onClick={() => navigate('/catalog')}
          className="carrinho-vazio-button"
        >
          Ver Produtos
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2 className="cart-title">Seu Carrinho</h2>
      <div className="cart-content">
        {items.map(item => (
          <div key={item.id} className="cart-item">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="cart-item-image"
            />
            <div className="cart-item-details">
              <h3 className="cart-item-name">{item.name}</h3>
              <p className="cart-item-brand">{item.brand}</p>
              <p className="cart-item-price">R$ {item.price.toFixed(2)}</p>
            </div>
            <div className="cart-item-actions">
              <div className="cart-item-quantity">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="cart-quantity-button"
                >
                  <Minus className="cart-quantity-icon" />
                </button>
                <span className="cart-quantity-value">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="cart-quantity-button"
                >
                  <Plus className="cart-quantity-icon" />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="cart-remove-button"
              >
                <Trash2 className="cart-remove-icon" />
              </button>
            </div>
          </div>
        ))}
        <div className="cart-summary">
          <div className="cart-total">
            Total: R$ {total.toFixed(2)}
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="button-checkout-cart"
          >
            Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
