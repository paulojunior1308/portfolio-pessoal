import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../css/ProductCard.css';

export function ProductCard({ product }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => 
            prev === product.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => 
            prev === 0 ? product.images.length - 1 : prev - 1
        );
    };

    return (
        <Link to={`/produto/${product.id}`} className="product-card">
            <div className="product-card-image">
                <div className="product-card-image-container">
                    <img
                        src={product.images[currentImageIndex]}
                        alt={product.name}
                    />
                    {product.images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="carousel-button left"
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="carousel-button right"
                                aria-label="Next image"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>
                <div className="product-card-info">
                    <h3 className="product-card-name">{product.nome}</h3>
                    <div className="product-card-price">
                        <span className="product-card-price-value">
                            R$ {product.preco.toFixed(2)}
                        </span>
                        <button 
                            className="product-card-button"
                            onClick={(e) => {
                                e.preventDefault();
                                // Add to cart logic here
                            }}
                        >
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}