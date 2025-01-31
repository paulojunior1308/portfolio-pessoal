import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Home } from '../js/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F6F6F6]">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Outras rotas serão adicionadas aqui */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;