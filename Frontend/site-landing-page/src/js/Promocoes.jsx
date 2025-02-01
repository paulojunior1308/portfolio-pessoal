import React from 'react';
import { ProductCard } from './ProductCard';
import { Tag, Timer } from 'lucide-react';
import '../css/Promocoes.css';

// Exemplo de produtos - Substitua com seus dados reais
const promocoes = [
  {
    id: '1',
    nome: 'Tênis Esportivo Runner',
    preco: 199.90,
    precoOriginal: 299.90,
    desconto: 33,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa'
    ],
    categoria: 'tenis'
  },
  {
    id: '2',
    nome: 'Camiseta Básica',
    preco: 49.90,
    precoOriginal: 79.90,
    desconto: 38,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27'
    ],
    categoria: 'roupas'
  },
  // Adicione mais produtos aqui
];

export function Promocoes() {
  return (
    <div className="container-promocoes">
      <div className="home-promocoes">
        <div className="home-container-promocoes">
          <div className="flex-custom">
            <div className="promocoes">
              <div className="promocoes-title">
                <Tag className="tag" />
                <h1 className="title">Promoções</h1>
              </div>
              <p className="promocoes-description">
                Aproveite descontos incríveis em produtos selecionados. Ofertas por tempo limitado!
              </p>
            </div>
            <div className="promocoes-countdown">
              <div className="promocoes-countdown-title">
                <Timer className="timer" />
                <span className="countdown-title">Termina em:</span>
              </div>
              <div className="promocoes-countdown-time">
                <div className="timer-promocoes">
                  <span className="span-timer">24</span>
                  <p className="text-timer">Horas</p>
                </div>
                <div className="timer-promocoes">
                  <span className="span-timer">59</span>
                  <p className="text-timer">Minutos</p>
                </div>
                <div className="timer-promocoes">
                  <span className="span-timer">59</span>
                  <p className="text-timer">Segundos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="promocoes-products">
          {promocoes.map(produto => (
            <ProductCard key={produto.id} product={produto} />
          ))}
        </div>
      </div>
    </div>
  );
}