import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useStore();
  
  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-playfair mb-4">Seu Carrinho</h1>
        <p className="text-gray-600 mb-8">Seu carrinho está vazio.</p>
        <Link to="/products" className="btn btn-primary">
          Continuar Comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-playfair mb-8">Seu Carrinho</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md mb-4"
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded"
              />
              
              <div className="flex-grow">
                <h3 className="font-playfair text-lg">{item.product.name}</h3>
                <p className="text-gray-600">
                  R$ {item.product.price.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.product.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="font-playfair text-xl mb-4">Resumo do Pedido</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Entrega</span>
              <span>Grátis</span>
            </div>
            <div className="border-t pt-2 font-semibold flex justify-between">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>
          <Link to="/checkout" className="btn btn-primary w-full">
            Finalizar Compra
          </Link>
        </div>
      </div>
    </div>
  );
}