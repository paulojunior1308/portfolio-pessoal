import { motion } from 'framer-motion';
import { Leaf, Book, Instagram, Facebook, Mail, Phone } from 'lucide-react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import MessageCircle from './assets/whatsapp.png';

const products = [
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dwbd43b88d/NATBRA-186458_1.jpg",
    name: "Kit Tododia Energia Flor de gengibre e Tangerina com Body Splash",
    price: "R$ 81,80",
    description: "Pele hidratada, perfumada e com mais energia."
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw5b40dea1/NATBRA-152300_1.jpg",
    name: "Creme Energizante Corporal 2 em 1 Tododia Energia",
    price: "R$ 72,90",
    description: "Hidratação imediata e refrescante que blinda a pele contra agressões externas."
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dweffa9015/NATBRA-152286_1.jpg",
    name: "Tododia Flor de Gengibre e Tangerina Body Splash Feminino",
    price: "R$ 83,90",
    description: "Perfumação leve e energizante que desperta os sentidos."
  }
];

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section id="home" className="pt-20 hero-pattern">
        <div className="container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-poppins font-bold text-dark mb-6">
              Revenda Natura: Beleza que Energiza
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Descubra produtos exclusivos e faça parte dessa jornada vibrante.
            </p>
            <a
              href="https://www.natura.com.br/consultoria/claudio211015cruzsantos"
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Book className="h-5 w-5" />
              <span>Acessar Revistas</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-dark text-center mb-12">
            Produtos em Promoção
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Magazines Section */}
      <section id="magazines" className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0">
                <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4">
                  Explore Nossas Revistas Online
                </h2>
                <p className="text-lg mb-6">
                  Descubra as últimas novidades e ofertas especiais
                </p>
                <a
                  href="https://www.natura.com.br/consultoria/claudio211015cruzsantos"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex items-center space-x-2"
                >
                  <Book className="h-5 w-5" />
                  <span>Acessar Revistas</span>
                </a>
              </div>
              <div className="w-full md:w-1/3">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800"
                    alt="Revista Natura"
                    className="rounded-lg shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Leaf className="h-6 w-6 text-primary" />
                <span className="ml-2 text-xl font-poppins font-bold">Natura</span>
              </div>
              <p className="text-gray-400">
                Transformando vidas através da beleza
              </p>
            </div>
            <div>
              <h3 className="font-poppins font-semibold text-lg mb-4">Contato</h3>
              <div className="space-y-2">
                <a href="mailto:contato@natura.com.br" className="flex items-center text-gray-400 hover:text-primary">
                  <Mail className="h-5 w-5 mr-2" />
                  contato@natura.com.br
                </a>
                <a href="tel:+557798411223" className="flex items-center text-gray-400 hover:text-primary">
                  <Phone className="h-5 w-5 mr-2" />
                  (77) 9841-1223
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-poppins font-semibold text-lg mb-4">Redes Sociais</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary">
                  <Facebook className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Natura. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <motion.a
        href="https://wa.me/557798411223"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#29a71a] text-white p-4 rounded-full shadow-lg hover:bg-[#29a71a] transition-colors duration-300 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <img src={MessageCircle} alt="WhatsApp" className="w-8 h-8" />
      </motion.a>
    </div>
  );
}

export default App;