import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import type { Product, CartItem, Sale } from '../types';

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'pix' | 'cash'>('credit');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      toast.error('Produto sem estoque');
      return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.cartQuantity >= product.quantity) {
          toast.error('Quantidade máxima atingida');
          return currentCart;
        }
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }
      return [...currentCart, { ...product, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.id === productId) {
          const newQuantity = item.cartQuantity + delta;
          if (newQuantity < 1) return item;
          if (newQuantity > item.quantity) {
            toast.error('Quantidade máxima atingida');
            return item;
          }
          return { ...item, cartQuantity: newQuantity };
        }
        return item;
      })
    );
  };

  const finalizeSale = async () => {
    if (cart.length === 0) {
      toast.error('Adicione produtos ao carrinho');
      return;
    }

    try {
      setLoading(true);
      // Create the sale
      const sale: Omit<Sale, 'id'> = {
        items: cart,
        total: total,
        paymentMethod,
        createdAt: new Date(),
        userId: user?.uid || ''
      };

      const saleRef = await addDoc(collection(db, 'sales'), sale);
      const saleId = saleRef.id;
      console.log(`Sale created with ID: ${saleId}`);

      // Update product quantities
      for (const item of cart) {
        const productRef = doc(db, 'products', item.id);
        await updateDoc(productRef, {
          quantity: item.quantity - item.cartQuantity,
          updatedAt: serverTimestamp()
        });
      }

      setCart([]);
      fetchProducts();
      toast.success('Venda finalizada com sucesso');
    } catch (error) {
      console.error('Error finalizing sale:', error);
      toast.error('Erro ao finalizar venda');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  return (
    <Layout title="Nova Venda">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-poppins">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar produtos por nome ou código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acai-primary"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-acai-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.quantity <= 0}
                  className={`p-4 border rounded-lg transition-colors duration-200 text-left ${
                    product.quantity <= 0
                      ? 'border-red-200 bg-red-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-acai-primary'
                  }`}
                >
                  <h3 className="font-medium text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {product.price.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                  <p className={`text-sm mt-1 ${
                    product.quantity <= 0 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    Estoque: {product.quantity}
                  </p>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Nenhum produto encontrado
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart className="h-6 w-6 text-acai-primary" />
            <h2 className="text-xl font-semibold text-acai-primary font-pacifico">Carrinho</h2>
          </div>

          <div className="space-y-4 mb-6 max-h-[calc(100vh-400px)] overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Carrinho vazio</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {(item.price * item.cartQuantity).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 text-gray-600 hover:text-gray-800"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.cartQuantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 text-gray-600 hover:text-gray-800"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-acai-primary">
                {total.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['credit', 'debit', 'pix', 'cash'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-4 rounded-lg text-sm font-medium ${
                      paymentMethod === method
                        ? 'bg-acai-primary text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {method === 'credit'
                      ? 'Crédito'
                      : method === 'debit'
                      ? 'Débito'
                      : method === 'pix'
                      ? 'PIX'
                      : 'Dinheiro'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={finalizeSale}
            disabled={cart.length === 0 || loading}
            className="w-full py-3 bg-acai-success text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Processando...' : 'Finalizar Venda'}
          </button>
        </div>
      </div>
    </Layout>
  );
}