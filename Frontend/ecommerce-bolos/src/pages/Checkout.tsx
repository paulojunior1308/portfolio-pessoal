import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { createOrder } from '../lib/firebase/orders';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'money', label: 'Dinheiro' },
  { id: 'debit', label: 'Débito' },
  { id: 'credit', label: 'Crédito' },
  { id: 'pix', label: 'PIX' }
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, user } = useStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart.length, navigate]);

  const sendWhatsAppMessage = (orderData: any) => {
    const items = orderData.items.map((item: any) => 
      `\n🍽️ *${item.product.name}* — ${item.quantity}x R$ ${(item.product.price * item.quantity).toFixed(2)}`
    ).join('');
  
    const message = 
      `*📢 NOVO PEDIDO RECEBIDO!*\n\n` +
      `👤 *Cliente:* ${user?.name}\n` +
      `📱 *Contato:* ${user?.phone}\n` +
      `📍 *Endereço:* ${orderData.address}\n\n` +
      `💳 *Forma de Pagamento:* ${PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}\n\n` +
      `🛒 *Itens do Pedido:*${items}\n\n` +
      `💰 *Total:* R$ ${orderData.total.toFixed(2)}\n\n` +
      `✅ *Seu pedido foi confirmado! Em breve entraremos em contato.*`;
  
    const whatsappUrl = `https://wa.me/5577999928847?text=${encodeURIComponent(message)}`;
  
    // Criar um link invisível e simular o clique
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank'; // Abrir em uma nova aba
    link.rel = 'noopener noreferrer'; // Boas práticas de segurança
    link.style.display = 'none'; // Esconder o link
    document.body.appendChild(link); // Adicionar ao DOM
    link.click(); // Simular o clique
    document.body.removeChild(link); // Remover o link do DOM
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!paymentMethod) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }
    
    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const address = {
        street: formData.get('street') as string,
        number: formData.get('number') as string,
        complement: formData.get('complement') as string,
        neighborhood: formData.get('neighborhood') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
      };

      const fullAddress = `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}, ${address.neighborhood}, ${address.city} - ${address.state}`;

      const orderData = {
        userId: user.id,
        items: cart,
        total,
        address: fullAddress,
        paymentMethod: PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || paymentMethod,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };

      await createOrder(orderData);
      sendWhatsAppMessage(orderData);
      clearCart();
      toast.success('Pedido realizado com sucesso!');
      navigate('/profile');
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      toast.error('Erro ao processar o pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || cart.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-playfair mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="font-playfair text-xl mb-4">Endereço de Entrega</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                  Rua
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  required
                  className="input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                    Número
                  </label>
                  <input
                    type="text"
                    id="number"
                    name="number"
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="complement" className="block text-sm font-medium text-gray-700">
                    Complemento
                  </label>
                  <input
                    type="text"
                    id="complement"
                    name="complement"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">
                  Bairro
                </label>
                <input
                  type="text"
                  id="neighborhood"
                  name="neighborhood"
                  required
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Cidade
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-playfair text-xl mb-4">Forma de Pagamento</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label key={method.id} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-radio h-4 w-4 text-wine"
                  />
                  <span className="text-gray-700">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Processando...' : 'Confirmar Pedido'}
          </button>
        </form>

        <div>
          <h2 className="font-playfair text-xl mb-4">Resumo do Pedido</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            {cart.map((item) => (
              <div key={item.product.id} className="flex justify-between mb-2">
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <span>
                  R$ {(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t mt-4 pt-4 font-semibold flex justify-between">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}