import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const ToggleMenu = () => {
  const [isChecked, setIsChecked] = useState(false);
  const location = useLocation();
  
  const handleToggleChange = () => {
    setIsChecked(!isChecked);
  };

  const handleLinkClick = (path) => {
    if (location.pathname === path) {
      // Força a atualização, mas normalmente não é necessário com React Router
      window.location.reload(); 
    }
    setIsChecked(false); 
  };
  
  // Correção da construção da classe
  const headerClass = location.pathname === '/' ? 'header home-header' 
  : location.pathname === '/sobre' ? 'header sobre-header' 
      : location.pathname === '/projetos' ? 'header projetos-header' : 'header projetos-header';

  return (
    <header id="header" className={headerClass}>
      <Helmet>
        <meta name="theme-color" content="#020272"/>
      </Helmet>
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
  );
};

export default ToggleMenu;
