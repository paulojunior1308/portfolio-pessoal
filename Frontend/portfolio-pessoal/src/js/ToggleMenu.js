import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ToggleMenu = () => {
  const [isChecked, setIsChecked] = useState(false);
  const location = useLocation();

  const handleToggleChange = () => {
    setIsChecked(!isChecked);
  };

  const handleLinkClick = (path) => {
    if (location.pathname === path) {
      window.location.reload(); // Recarrega a página se já estiver na rota
    }
    setIsChecked(false); // Fecha o menu após o clique
  };

  return (
    <main id="home" className="home">
      <header id="header" className="header">
        <div className="logo">
          <Link to="/" onClick={() => handleLinkClick('/')}>
            Paulo Junior <span className="destaque">│Dev.</span>
          </Link>
        </div>
        <div className="checkbox-container">
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              id="toggle"
              checked={isChecked}
              onChange={handleToggleChange}
            />
            <label className="checkbox" htmlFor="toggle">
              <div className="trace"></div>
              <div className="trace"></div>
              <div className="trace"></div>
            </label>
            <div className={`menu ${isChecked ? 'open' : ''}`}></div>
            <nav className={`menu-items ${isChecked ? 'open' : ''}`}>
              <ul>
                <li>
                  <Link to="/" onClick={() => handleLinkClick('/')}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/sobre" onClick={() => handleLinkClick('/sobre')}>
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link to="/projetos" onClick={() => handleLinkClick('/projetos')}>
                    Projetos
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </main>
  );
};

export default ToggleMenu;
