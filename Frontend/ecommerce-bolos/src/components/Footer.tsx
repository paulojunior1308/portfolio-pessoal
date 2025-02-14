import {  Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-soft-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-playfair text-xl mb-4">Cida Confeitaria</h3>
            <p className="text-gray-400">
              Doces e bolos artesanais para seus momentos especiais.
            </p>
          </div>
          
          <div>
            <h4 className="font-playfair text-lg mb-4">Contato</h4>
            <p className="text-gray-400">Email: contact@sweetdelights.com</p>
            <p className="text-gray-400">Phone: (77) 99992-8847</p>
          </div>
          
          <div>
            <h4 className="font-playfair text-lg mb-4">Redes Sociais</h4>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/cidaconfeitaria1/" target='_blank' className="text-gray-400 hover:text-[#E1306C]">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://wa.me/5577999928847" target='_blank' className="text-gray-400 hover:text-[#29a71a]">
                <MessageCircle className="w-6 h-6 " />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2025 Cida Confeitaria. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}