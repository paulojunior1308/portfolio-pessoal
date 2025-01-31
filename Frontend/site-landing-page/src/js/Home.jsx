import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCard } from "./ProductCard";
import '../css/Home.css';

const produtosExemplo = [
    {
        id: '1',
        nome: 'Camiseta Básica',
        preco: 79.90,
        images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80'
        ],
        categoria: 'roupas'
    },
    {
        id: '2',
        nome: 'Jaqueta Jeans',
        preco: 199.90,
        images: [
            'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=600&q=80'
        ],
        categoria: 'roupas'
    },
    {
        id: '3',
        nome: 'Tenis',
        preco: 199.90,
        images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1200'
        ],
        categoria: 'roupas'
    },
];

export function Home() {
    return (
        <div className="home">
            <div className="home-container">
                <div className="home-header">
                    <div className="home-title">
                        <div className="home-title-text">
                            <h1>Descubra seu estilo</h1>
                            <p>Explore nossa coleção de roupas e tênis premium.</p>
                            <Link to="/produtos" className="home-link">
                                Comprar Agora
                                <ArrowRight className="home-arrow"/>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="home-products">
                    <h2>Categorias em Destaque</h2>
                    <div className="home-products-roupas">
                        <Link to="/produtos/roupas" className="link-roupas">
                            <img
                                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80"
                                alt="Roupas"
                            />
                            <div className="home-products-text">
                                <h3>Roupas</h3>
                            </div>
                        </Link>
                    </div>

                    <div className="home-products-tenis">
                        <Link to="/produtos/tenis" className="link-tenis">
                            <img
                                src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80"
                                alt="Tênis"
                            />
                            <div className="home-products-text">
                                <h3>Tênis</h3>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="new-products">
                    <div className="new-products-title">
                        <div className="new-products-title-text">
                            <h2>Novos Produtos</h2>
                            <Link to="/lancamentos" className="new-products-link">
                                Ver Todos
                                <ArrowRight className="arrow-right-new"/>
                            </Link>
                        </div>
                        <div className="new-products-title-line">
                            {produtosExemplo.map(produto => (
                                <ProductCard key={produto.id} product={produto} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="newsletter">
                    <div className="newsletter-title">
                        <h2>Inscreva-se em Nossa Newsletter</h2>
                        <p>Receba ofertas especiais, promoções e novidades em primeira mão</p>
                        <form className="newsletter-form">
                            <input type="email" placeholder="Seu e-mail" />
                            <button type="submit">Inscrever-se</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}