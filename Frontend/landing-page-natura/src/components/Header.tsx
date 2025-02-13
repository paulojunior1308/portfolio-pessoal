import { useState } from 'react';
import { Menu, X, Leaf } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="ml-2 text-2xl font-poppins font-bold text-dark">Natura</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-dark hover:text-primary transition-colors">Início</a>
            <a href="#products" className="text-dark hover:text-primary transition-colors">Produtos</a>
            <a href="#magazines" className="text-dark hover:text-primary transition-colors">Revistas</a>
            <a href="#contact" className="text-dark hover:text-primary transition-colors">Contato</a>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <nav className="flex flex-col space-y-4 py-4">
              <a href="#home" className="text-dark hover:text-primary transition-colors">Início</a>
              <a href="#products" className="text-dark hover:text-primary transition-colors">Produtos</a>
              <a href="#magazines" className="text-dark hover:text-primary transition-colors">Revistas</a>
              <a href="#contact" className="text-dark hover:text-primary transition-colors">Contato</a>
              <button className="btn-primary w-full">Conheça Nossos Produtos</button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}