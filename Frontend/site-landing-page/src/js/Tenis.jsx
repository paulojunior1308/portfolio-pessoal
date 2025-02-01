import React, { useState, useCallback } from 'react';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, ChevronDown, ChevronUp, Search } from 'lucide-react';
import '../css/Tenis.css';

// Dados constantes
const PRODUTOS = [
    {
        id: '3',
        nome: 'Tenis',
        preco: 199.90,
        images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1200'
        ],
        categoria: 'tenis'
    },
];

const FILTRO_OPTIONS = {
  marcas: ['Nike', 'Adidas', 'Puma', 'Style Brand', 'Urban Co'],
  cores: ['preto', 'branco', 'azul', 'vermelho', 'cinza'],
  tamanhos: ['PP', 'P', 'M', 'G', 'GG', 'XG'],
  generos: ['masculino', 'feminino', 'unissex'],
  categorias: ['camisetas', 'calças', 'vestidos', 'blusas', 'jaquetas']
};

// Componente de Seção de Filtro
const FiltroSection = ({ titulo, items, tipo, valores, expandido, onToggle, onChange, searchTerm, onSearchChange }) => (
  <div className="filtro-section">
    <button 
      onClick={() => onToggle(tipo)} 
      className="filtro-button"
    >
      {titulo}
      {expandido ? <ChevronUp className="icon" /> : <ChevronDown className="icon" />}
    </button>
    {expandido && (
      <div className="filtro-options">
        <div className="filtro-search">
          <input
            type="text"
            placeholder={`Buscar ${titulo.toLowerCase()}`}
            value={searchTerm[tipo] || ''}
            onChange={(e) => onSearchChange(tipo, e.target.value)}
            className="search-input"
          />
          <Search className="search-icon" />
        </div>
        {items
          .filter(item => 
            item.toLowerCase().includes((searchTerm[tipo] || '').toLowerCase())
          )
          .map(item => (
            <label key={item} className="filtro-label">
              <input
                type="checkbox"
                checked={valores.includes(item)}
                onChange={() => onChange(tipo, item)}
                className="filtro-checkbox"
              />
              <span className="filtro-text">{item}</span>
            </label>
          ))
        }
      </div>
    )}
  </div>
);

export function Tenis() {
  const [filtrosExpandidos, setFiltrosExpandidos] = useState({
    preco: true,
    marcas: false,
    cores: false,
    tamanhos: false,
    generos: false,
    categorias: false
  });
  
  const [filtros, setFiltros] = useState({
    precoMin: '',
    precoMax: '',
    marcas: [],
    cores: [],
    tamanhos: [],
    generos: [],
    categorias: []
  });

  const [searchTerm, setSearchTerm] = useState({});


  const toggleFiltro = useCallback((tipo) => {
    setFiltrosExpandidos(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }));
  }, []);

  const handleFiltroChange = useCallback((tipo, item) => {
    setFiltros(prev => {
      const valores = prev[tipo];
      const novoValores = valores.includes(item)
        ? valores.filter(v => v !== item)
        : [...valores, item];
      
      return {
        ...prev,
        [tipo]: novoValores
      };
    });
  }, []);

  const handleSearchChange = useCallback((tipo, valor) => {
    setSearchTerm(prev => ({
      ...prev,
      [tipo]: valor
    }));
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltros({
      precoMin: '',
      precoMax: '',
      marcas: [],
      cores: [],
      tamanhos: [],
      generos: [],
      categorias: []
    });
    setSearchTerm({});
  }, []);

  // Lógica de filtragem
  const produtosFiltrados = PRODUTOS.filter(produto => {
    const precoMinFiltro = Number(filtros.precoMin) || 0;
    const precoMaxFiltro = Number(filtros.precoMax) || Infinity;
    
    const atendeFiltroPreco = produto.preco >= precoMinFiltro && produto.preco <= precoMaxFiltro;
    const atendeFiltroMarca = filtros.marcas.length === 0 || filtros.marcas.includes(produto.marca);
    const atendeFiltroCor = filtros.cores.length === 0 || filtros.cores.includes(produto.cor);
    const atendeFiltroCategorias = filtros.categorias.length === 0 || filtros.categorias.includes(produto.categoria);
    const atendeFiltroTamanho = filtros.tamanhos.length === 0 || filtros.tamanhos.includes(produto.tamanho);
    const atendeFiltroGenero = filtros.generos.length === 0 || filtros.generos.includes(produto.genero);

    return atendeFiltroPreco && 
           atendeFiltroMarca && 
           atendeFiltroCor && 
           atendeFiltroCategorias && 
           atendeFiltroTamanho && 
           atendeFiltroGenero;
  });

  return (
    <div className="tenis-container">
      <div className="tenis-content">
        <div className="header">
          <div className="header-title">
            <h1>Tênis</h1>
            <p className="results-count">
              {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          </div>
          <div className="header-actions">
            <button onClick={limparFiltros} className="clear-filters">
              Limpar Filtros
            </button>
          </div>
        </div>

        <div className="main-content">
          <div className="sidebar">
            <div className="sidebar-header">
              <SlidersHorizontal className="icon" />
              <h2>Filtros</h2>
            </div>

            <div className="filtro-section">
              <button onClick={() => toggleFiltro('preco')} className="filtro-button">
                Faixa de Preço
                {filtrosExpandidos.preco ? <ChevronUp className="icon" /> : <ChevronDown className="icon" />}
              </button>
              {filtrosExpandidos.preco && (
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Preço mínimo"
                    value={filtros.precoMin}
                    onChange={(e) => setFiltros({...filtros, precoMin: e.target.value})}
                    className="price-input"
                  />
                  <input
                    type="number"
                    placeholder="Preço máximo"
                    value={filtros.precoMax}
                    onChange={(e) => setFiltros({...filtros, precoMax: e.target.value})}
                    className="price-input"
                  />
                </div>
              )}
            </div>

            <FiltroSection
              titulo="Marcas"
              items={FILTRO_OPTIONS.marcas}
              tipo="marcas"
              valores={filtros.marcas}
              expandido={filtrosExpandidos.marcas}
              onToggle={toggleFiltro}
              onChange={handleFiltroChange}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
            <FiltroSection
              titulo="Cores"
              items={FILTRO_OPTIONS.cores}
              tipo="cores"
              valores={filtros.cores}
              expandido={filtrosExpandidos.cores}
              onToggle={toggleFiltro}
              onChange={handleFiltroChange}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
            <FiltroSection
              titulo="Tamanhos"
              items={FILTRO_OPTIONS.tamanhos}
              tipo="tamanhos"
              valores={filtros.tamanhos}
              expandido={filtrosExpandidos.tamanhos}
              onToggle={toggleFiltro}
              onChange={handleFiltroChange}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
            <FiltroSection
              titulo="Gênero"
              items={FILTRO_OPTIONS.generos}
              tipo="generos"
              valores={filtros.generos}
              expandido={filtrosExpandidos.generos}
              onToggle={toggleFiltro}
              onChange={handleFiltroChange}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
            <FiltroSection
              titulo="Categorias"
              items={FILTRO_OPTIONS.categorias}
              tipo="categorias"
              valores={filtros.categorias}
              expandido={filtrosExpandidos.categorias}
              onToggle={toggleFiltro}
              onChange={handleFiltroChange}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
          </div>

          <div className="products-grid with-sidebar">
            {produtosFiltrados.map(produto => (
              <ProductCard key={produto.id} product={produto} />
            ))}
            {produtosFiltrados.length === 0 && (
              <div className="no-results">
                <p>Nenhum produto encontrado com os filtros selecionados.</p>
                <button onClick={limparFiltros} className="clear-filters">
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}