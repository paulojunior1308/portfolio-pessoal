import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Importe o componente ToggleMenu
import Home from './Home'; // Importe suas páginas
import Sobre from './Sobre';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
      </Routes>
    </Router>
  );
};

export default App;
