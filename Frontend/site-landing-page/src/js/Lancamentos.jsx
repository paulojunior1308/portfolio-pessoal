import React from 'react';
import { ProductCard } from './ProductCard';
import { Sparkles } from 'lucide-react';
import '../css/Lancamentos.css';

// Exemplo de produtos - Substitua com seus dados reais
const lancamentos = [
  {
    id: '1',
    nome: 'Tênis Limited Edition',
    preco: 499.90,
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2'
    ],
    categoria: 'tenis'
  },
  {
    id: '2',
    nome: 'Jaqueta Premium',
    preco: 359.90,
    images: [
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a'
    ],
    categoria: 'roupas'
  },
  // Adicione mais produtos aqui
];

export function Lancamentos() {
  return (
    <div className="container">
      <div className="lancamentos">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
            alt="Lançamentos"
            className="image-lancamentos"
          />
          <div className="lancamentos-overlay">
            <div className="lancamentos-content">
              <div className="container-box">
                <Sparkles className="sparkles" />
                <h1 className="title">Lançamentos</h1>
              </div>
              <p className="description">
                Descubra as últimas tendências e novidades em moda. Peças exclusivas que acabaram de chegar para você.
              </p>
            </div>
          </div>
        </div>

        <div className="lancamentos-grid">
          {lancamentos.map(produto => (
            <ProductCard key={produto.id} product={produto} />
          ))}
        </div>
      </div>
    </div>
  );
}