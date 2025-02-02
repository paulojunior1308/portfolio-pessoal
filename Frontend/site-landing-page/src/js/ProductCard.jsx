import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useFavorites } from './favorites';
import { useCart } from './Cart';
import '../css/ProductCard.css';

export function ProductCard({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const isFavorite = favorites.some(fav => fav.id === product.id);

  const nextImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    if (isFavorite) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <Link to={`/produto/${product.id}`} className="product-card">
      <div className="product-image-container">
        <img
          src={product.images[currentImageIndex]}
          alt={product.nome}
          className="product-image"
        />
        {product.images.length > 1 && (
          <>
            <button onClick={prevImage} className="nav-button prev">
              <ChevronLeft className="nav-icon" />
            </button>
            <button onClick={nextImage} className="nav-button next">
              <ChevronRight className="nav-icon" />
            </button>
          </>
        )}
        <button 
          onClick={toggleFavorite} 
          className={`favorite-button ${isFavorite ? 'active' : ''}`}
        >
          <Heart className="favorite-icon"
          fill={isFavorite ? "#FF6B35" : "none"}
          stroke={isFavorite ? "#FF6B35" : "currentColor"} />
        </button>
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.nome}</h3>
        <div className="product-footer">
          <span className="product-price">
            R$ {product.preco.toFixed(2)}
          </span>
          <button 
            onClick={handleAddToCart}
            className="add-to-cart">
            Adicionar
          </button>
        </div>
      </div>
    </Link>
  );
}