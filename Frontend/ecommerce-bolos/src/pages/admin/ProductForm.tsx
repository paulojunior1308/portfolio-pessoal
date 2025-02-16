import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { Product } from '../../types';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'Bolos'
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ 
            id: docSnap.id, 
            ...data,
            price: Number(data.price) // Garantir que o preço seja um número
          } as Product);
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        toast.error('Erro ao carregar produto');
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...product,
        price: Number(product.price) || 0
      };

      if (id) {
        // Atualizar produto existente
        await setDoc(doc(db, 'products', id), productData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Criar novo produto
        await addDoc(collection(db, 'products'), productData);
        toast.success('Produto criado com sucesso!');
      }
      navigate('/admin/products');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProduct({ 
      ...product, 
      price: value === '' ? 0 : Number(value)
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-playfair mb-8">
        {id ? 'Editar Produto' : 'Novo Produto'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome
          </label>
          <input
            type="text"
            id="name"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            required
            className="input"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            id="description"
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            required
            className="input min-h-[100px]"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Preço
          </label>
          <input
            type="number"
            id="price"
            value={product.price}
            onChange={handlePriceChange}
            required
            min="0"
            step="0.01"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            URL da Imagem
          </label>
          <input
            type="url"
            id="image"
            value={product.image}
            onChange={(e) => setProduct({ ...product, image: e.target.value })}
            required
            className="input"
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Categoria
          </label>
          <select
            id="category"
            value={product.category}
            onChange={(e) => setProduct({ ...product, category: e.target.value })}
            required
            className="input"
          >
            <option value="Bolos">Bolos</option>
            <option value="Doces">Doces</option>
            <option value="Cupcakes">Cupcakes</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
}