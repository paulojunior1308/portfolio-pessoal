import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { createOrder } from '../lib/firebase/orders';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, user } = useStore();
  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart.length, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
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

      await createOrder({
        userId: user.uid,
        items: cart,
        total,
        address: `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}, ${address.neighborhood}, ${address.city} - ${address.state}`,
        status: 'pending'
      });

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
            <div className="space-y-4">
              <div>
                <label htmlFor="card" className="block text-sm font-medium text-gray-700">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  id="card"
                  name="card"
                  required
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
                    Validade
                  </label>
                  <input
                    type="text"
                    id="expiry"
                    name="expiry"
                    placeholder="MM/AA"
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    required
                    className="input"
                  />
                </div>
              </div>
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