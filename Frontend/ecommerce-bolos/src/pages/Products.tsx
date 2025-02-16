import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';

export default function Products() {
  const { addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('name'));
        const snapshot = await getDocs(q);
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(productsData);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        toast.error('Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({ product, quantity: 1 });
    toast.success('Produto adicionado ao carrinho!');
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-playfair text-center mb-12">Nossas Delícias</h1>
        
        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            {['all', 'Bolos', 'Doces', 'Cupcakes'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-wine text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300 first:rounded-l-md last:rounded-r-md`}
              >
                {category === 'all' ? 'Todos' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products
            .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
            .map((product) => (
              <div key={product.id} className="card">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-playfair text-xl mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn btn-primary"
                    >
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {products.length === 0 && (
          <p className="text-center text-gray-600 mt-8">
            Nenhum produto encontrado.
          </p>
        )}
      </div>
    </div>
  );
}