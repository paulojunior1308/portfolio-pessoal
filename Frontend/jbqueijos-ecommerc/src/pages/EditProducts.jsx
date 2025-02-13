import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Link } from 'react-router-dom';
import { Search, Edit } from 'lucide-react';
import '../styles/EditProducts.css';

function EditProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
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
    <div className="edit-products-container">
      <h2 className="edit-products-title">Editar Produtos</h2>
      
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

      <div className="products-list">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-item">
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-brand">{product.brand}</p>
              <p className="product-price">R$ {product.price.toFixed(2)}</p>
            </div>
            <Link to={`/edit-product/${product.id}`} className="edit-button">
              <Edit size={20} />
              <span>Editar</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EditProducts;