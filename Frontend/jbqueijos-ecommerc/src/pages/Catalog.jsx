import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCart } from '../context/CartContext';
import { addSampleProducts } from '../utils/sampleProducts';
import { Search } from 'lucide-react';
import '../styles/Catalog.css';

function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (productsData.length === 0) {
          await addSampleProducts();
          const newSnapshot = await getDocs(collection(db, 'products'));
          const newProductsData = newSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProducts(newProductsData);
        } else {
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="catalog-header">
        <h2 className="catalog-title">Nossos Produtos</h2>
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      <div className="catalog-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-brand">{product.brand}</p>
              <p className="product-description">{product.description}</p>
              <div className="product-details">
                <span className="product-price">R$ {product.price.toFixed(2)}</span>
                <span className="product-unit">{product.unit}</span>
              </div>
              <button onClick={() => addItem(product)} className="add-to-cart-btn">
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalog;