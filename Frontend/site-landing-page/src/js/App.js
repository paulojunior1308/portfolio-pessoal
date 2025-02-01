import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Home } from '../js/Home';
import { Roupas } from '../js/Roupas';
import { Tenis } from '../js/Tenis';
import { Promocoes } from '../js/Promocoes';
import { Lancamentos } from '../js/Lancamentos';

function App() {
  return (
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;