import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatDate';
import '../styles/Orders.css';

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setOrders(ordersData);
      } catch (err) {
        setError('Erro ao carregar pedidos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user.uid]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Carregando pedidos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2 className="orders-title">Meus Pedidos</h2>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>Você ainda não realizou nenhum pedido.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <span className="order-number">Pedido #{order.id.slice(0, 8)}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <span className={`order-status ${order.status}`}>
                  {order.status === 'pending' ? 'Pendente' : 
                   order.status === 'approved' ? 'Aprovado' : 
                   order.status === 'completed' ? 'Concluído' : 'Cancelado'}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img src={item.imageUrl} alt={item.name} className="item-image" />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p className="item-quantity">Quantidade: {item.quantity}</p>
                      <p className="item-price">R$ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  Total: R$ {order.total.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;