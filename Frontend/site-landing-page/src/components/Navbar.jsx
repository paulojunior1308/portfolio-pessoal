import { ShoppingCart, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToggleMenu from './ToggleMenu';
import '../css/Navbar.css';

export function Navbar() {
    return (
        <nav className='navbar'>
            <div className='logo'>
                {/* ToggleMenu para dispositivos móveis */}
                <div className="toggle-menu-container">
                    <ToggleMenu />
                </div>

                <Link to='/' className='logo-link'>ModaStyle</Link>

                {/* Menu Normal (Aparece apenas em telas maiores) */}
                <div className='menu'>
                    <Link to="/produtos/roupas" className='menu-link'>Roupas</Link>
                    <Link to="/produtos/tenis" className='menu-link'>Tênis</Link>
                    <Link to="/lancamentos" className='menu-link'>Lançamentos</Link>
                    <Link to="/promocoes" className='menu-link'>Promoções</Link>
                </div>

                {/* Ícones do Carrinho e Usuário */}
                <div className='icons'>
                    <Link to="/carrinho" className="link-carrinho">
                        <ShoppingCart className="cart"/>
                        <span className='carrinho-quantidade'>0</span>
                    </Link>
                    <Link to="/conta">
                        <User className="user"/>
                    </Link>
                </div>
            </div>
        </nav>
    );
}