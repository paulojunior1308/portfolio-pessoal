import React from 'react';
import { ProductCard } from './ProductCard';
import { Heart } from 'lucide-react';
import { useFavorites } from './favorites';
import '../css/Favoritos.css';

export function Favoritos() {
  const { favorites } = useFavorites();

  return (
    <div className="favoritos-container">
      <div className="favoritos-content">
        <div className="favoritos-header">
          <div className="header-title">
            <Heart className="heart-icon" />
            <h1>Meus Favoritos</h1>
          </div>
          <p className="results-count">
            {favorites.length} {favorites.length === 1 ? 'item' : 'itens'}
          </p>
        </div>

        {favorites.length > 0 ? (
          <div className="favorites-grid">
            {favorites.map(produto => (
              <ProductCard key={produto.id} product={produto} showFavoriteButton={true} />
            ))}
          </div>
        ) : (
          <div className="empty-favorites">
            <Heart className="empty-heart" />
            <h2>Sua lista de favoritos está vazia</h2>
            <p>Adicione itens aos favoritos para encontrá-los facilmente depois</p>
          </div>
        )}
      </div>
    </div>
  );
}