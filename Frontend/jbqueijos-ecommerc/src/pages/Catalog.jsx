import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCart } from '../context/CartContext';
import { addSampleProducts } from '../utils/sampleProducts';
import '../styles/Catalog.css';

function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Se não houver produtos, adiciona os produtos de exemplo
        if (productsData.length === 0) {
          await addSampleProducts();
          // Busca novamente após adicionar os produtos
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="catalog-title">Nossos Produtos</h2>
      <div className="catalog-grid">
        {products.map(product => (
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
