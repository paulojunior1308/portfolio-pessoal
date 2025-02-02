import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Home } from '../js/Home';
import { Roupas } from '../js/Roupas';
import { Tenis } from '../js/Tenis';
import { Promocoes } from '../js/Promocoes';
import { Lancamentos } from '../js/Lancamentos';
import { Favoritos } from '../js/Favoritos';
import { CartProvider } from '../js/Cart';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-[#F6F6F6]">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/produtos/roupas" element={<Roupas />} />
              <Route path="/produtos/tenis" element={<Tenis />} />
              <Route path="/promocoes" element={<Promocoes />} />
              <Route path="/lancamentos" element={<Lancamentos />} />
              <Route path="/favoritos" element={<Favoritos />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;