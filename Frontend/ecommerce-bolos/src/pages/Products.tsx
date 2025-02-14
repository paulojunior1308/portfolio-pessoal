import { useState } from 'react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

const SAMPLE_PRODUCTS = [
  {
    id: '1',
    name: 'Bolo de Chocolate',
    description: 'Bolo macio com cobertura de chocolate belga',
    price: 50.00,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
    category: 'Bolos'
  },
  {
    id: '2',
    name: 'Brigadeiros Gourmet',
    description: 'Caixa com 12 brigadeiros artesanais',
    price: 25.00,
    image: 'https://images.unsplash.com/photo-1581343600721-f4ea1318ec57',
    category: 'Doces'
  },
  // Add more sample products as needed
];

export default function Products() {
  const { addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleAddToCart = (product: typeof SAMPLE_PRODUCTS[0]) => {
    addToCart({ product, quantity: 1 });
    toast.success('Produto adicionado ao carrinho!');
  };

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
          {SAMPLE_PRODUCTS.filter(
            product => selectedCategory === 'all' || product.category === selectedCategory
          ).map((product) => (
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
      </div>
    </div>
  );
}