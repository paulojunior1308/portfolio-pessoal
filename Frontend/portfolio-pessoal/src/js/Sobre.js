import React, { useState } from "react";
import "../css/Sobre.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link } from 'react-router-dom'; 
const Sobre = () => {

  const [isChecked, setIsChecked] = useState(false);

  const handleToggleChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <main id="sobre-home" className="sobre-home">
      <header id="sobre-header" className="sobre-header">
        <div className="sobre-logo">
          <a href="index.html">
            Paulo Junior <span className="sobre-destaque">│Dev.</span>
          </a>
        </div>
        <div className="sobre-checkbox-container">
          <div className="sobre-checkbox-wrapper">
            <input type="checkbox" id="toggle" checked={isChecked} onChange={handleToggleChange} />
            <label className="sobre-checkbox" for="toggle">
              <div className="sobre-trace"></div>
              <div className="sobre-trace"></div>
              <div className="sobre-trace"></div>
            </label>
            <div className={`sobre-menu ${isChecked ? 'open' : ''}`}></div>
            <nav className={`sobre-menu-items ${isChecked ? 'open' : ''}`}>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/sobre">Sobre</Link></li>
                <li><Link to="/projetos">Projetos</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
        <footer className="sobre-footer">
          <p>Todos os direitos reservados<br />Desenvolvido <span class="sobre-destaque">Paulo Junior│Dev.</span></p>
        </footer>
      </main>
  );
};

export default Sobre;
