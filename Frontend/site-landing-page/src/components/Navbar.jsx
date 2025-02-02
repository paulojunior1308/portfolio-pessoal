import { ShoppingCart, User, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useFavorites } from '../js/favorites';
import { useCart } from '../js/Cart';
import { CartDropdown } from '../js/CartDropdown';
import ToggleMenu from './ToggleMenu';
import '../css/Navbar.css';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { favorites } = useFavorites();
    const { getCartCount } = useCart();
    const cartDropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target)) {
                setIsCartOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className='navbar'>
            <div className='logo'>
                <div className="toggle-menu-container">
                    <ToggleMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
                </div>

                <Link to='/' className='logo-link'>ModaStyle</Link>


                <div className='procurar'>
                    <input type="text" placeholder="O que você está procurando?" />
                    <Search className="search-icon" />
                </div>
                
                <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/produtos/roupas" className='mobile-menu-link'>Roupas</Link>
                    <Link to="/produtos/tenis" className='mobile-menu-link'>Tênis</Link>
                    <Link to="/lancamentos" className='mobile-menu-link'>Lançamentos</Link>
                    <Link to="/promocoes" className='mobile-menu-link'>Promoções</Link>
                    <Link to="/conta" className='mobile-menu-link'>Minha Conta</Link>
                </div>

                <div className='icons'>
                    <Link to="/favoritos" className="icon-link">
                        <Heart className="icon" color='#fff'/>
                        {favorites.length > 0 && (
                            <span className='badge'>{favorites.length}</span>
                        )}
                    </Link>
                    <div className="cart-container" ref={cartDropdownRef}>
                        <button 
                            className="icon-link cart-button"
                            onClick={() => setIsCartOpen(!isCartOpen)}
                        >
                            <ShoppingCart className="icon" color='#fff' />
                            <span className='badge'>{getCartCount()}</span>
                        </button>
                        <CartDropdown isOpen={isCartOpen} />
                    </div>
                    <Link to="/conta" className="icon-link desktop-only">
                        <User className="icon" color='#fff' />
                    </Link>
                </div>
            </div>
        </nav>
        
    );
}