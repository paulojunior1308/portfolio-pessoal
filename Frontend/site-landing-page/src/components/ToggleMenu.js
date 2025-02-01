import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/ToggleMenu.css';

const ToggleMenu = () => {
  const [isChecked, setIsChecked] = useState(false);
  
  const handleToggleChange = () => {
    setIsChecked(!isChecked);
  };

  const handleLinkClick = () => {
    setIsChecked(false);
  };

  return (
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
        <nav className={`menu-items ${isChecked ? 'open' : ''}`}>
          <ul>
            <li>
              <Link to="/produtos/roupas" onClick={handleLinkClick}>Roupas</Link>
            </li>
            <li>
              <Link to="/produtos/tenis" onClick={handleLinkClick}>Tênis</Link>
            </li>
            <li>
              <Link to="/lancamentos" onClick={handleLinkClick}>Lançamentos</Link>
            </li>
            <li>
              <Link to="/promocoes" onClick={handleLinkClick}>Promoções</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ToggleMenu;