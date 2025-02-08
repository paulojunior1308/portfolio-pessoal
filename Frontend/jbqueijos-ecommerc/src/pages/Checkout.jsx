import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCart } from '../context/CartContext';
import { sendQuoteRequest } from '../services/emailService';
import AuthModal from '../components/AuthModal';
import '../styles/Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await sendQuoteRequest(items);

      try {
        await addDoc(collection(db, 'quotes'), {
          items,
          total,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      } catch (firebaseError) {
        console.warn('Falha ao salvar orçamento no banco de dados, mas o email foi enviado:', firebaseError);
      }

      setSuccess(true);
      clearCart();
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Erro ao enviar orçamento:', error);
      if (error.message === 'Usuário não está autenticado') {
        setShowAuthModal(true);
      } else {
        setError(
          'Ocorreu um erro ao enviar seu orçamento. Por favor, tente novamente ou entre em contato conosco.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container-success">
        <div className="home-success">
          <h2 className="title-success">
            Orçamento enviado com sucesso!
          </h2>
          <p className="paragrafo-success">
            Orçamento enviado para um vendedor de nossa equipe. Entraremos em contato em breve.
          </p>
          <p className="redireciona-success">
            Redirecionando para a página inicial...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-checkout">
      <h2 className="title-checkout">Solicitar Orçamento</h2>
      {error && (
        <div className="custom-alert">
          {error}
        </div>
      )}
      <div className="custom-card">
        <div className="custom-margin">
          <h3 className="custom-heading">
            Resumo do Pedido
          </h3>
          {items.map(item => (
            <div key={item.id} className="custom-flex-item">
              <span>{item.name} x {item.quantity}</span>
              <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="custom-border">
            <div className="custom-flex">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmitQuote}
          disabled={loading}
          className="custom-button"
        >
          {loading ? 'Enviando orçamento...' : 'Solicitar Orçamento'}
        </button>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Para solicitar um orçamento, é necessário fazer login ou criar uma conta."
      />
    </div>
  );
}

export default Checkout;