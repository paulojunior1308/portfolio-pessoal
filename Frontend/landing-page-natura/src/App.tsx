import { motion } from 'framer-motion';
import {  Book } from 'lucide-react';
import Header from './components/Header';
import ProductCarousel from './components/ProductCarousel';
import MessageCircle from './assets/whatsapp.png';

const products = [
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dwbd43b88d/NATBRA-186458_1.jpg",
    name: "Kit Tododia Energia Flor de gengibre e Tangerina com Body Splash",
    price: "R$ 81,80",
    description: "Pele hidratada, perfumada e com mais energia.",
    url: "https://www.natura.com.br/p/kit-tododia-energia-flor-de-gengibre-e-tangerina-com-body-splash/NATBRA-186458?position=1&listTitle=tab+showcase+-+experimente+uma+exclusiva+rotina+energizante&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw5b40dea1/NATBRA-152300_1.jpg",
    name: "Creme Energizante Corporal 2 em 1 Tododia Energia",
    price: "R$ 72,90",
    description: "Hidratação imediata e refrescante que blinda a pele contra agressões externas.",
    url: "https://www.natura.com.br/p/creme-energizante-corporal-2-em-1-tododia-energia-400-ml/NATBRA-152300?position=2&listTitle=tab+showcase+-+experimente+uma+exclusiva+rotina+energizante&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dweffa9015/NATBRA-152286_1.jpg",
    name: "Tododia Flor de Gengibre e Tangerina Body Splash Feminino",
    price: "R$ 83,90",
    description: "Perfumação leve e energizante que desperta os sentidos.",
    url: "https://www.natura.com.br/p/tododia-flor-de-gengibre-e-tangerina-body-splash-feminino-200-ml/NATBRA-152286?position=3&listTitle=tab+showcase+-+experimente+uma+exclusiva+rotina+energizante&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw7b5a8593/NATBRA-106124_1.jpg",
    name: "Máscara para Cílios Secret Una",
    price: "R$ 87,90",
    description: "Máscara para Cílios Secret Una.",
    url: "https://www.natura.com.br/p/mascara-para-cilios-secret-una-8-ml/NATBRA-106124?position=1&listTitle=search+results+list+showcase+-+M%C3%A1scara+para+C%C3%ADlios+Secret+Una&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw6678233f/Produtos/NATBRA-69725_2.jpg",
    name: "Protetor Antioleosidade Redutor de Poros FPS 30 FPUVA 10 Chronos",
    price: "R$ 68,90",
    description: "Reduz visivelmente o tamanho dos poros e controla a oleosidade da pele por até 12 horas.",
    url: "https://www.natura.com.br/p/protetor-antioleosidade-redutor-de-poros-fps-30-fpuva-10-chronos-50ml/NATBRA-PAI69725?position=3&listTitle=search+results+list+showcase+-+chronos&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dwb165dddc/NATBRA-88103_2.jpg",
    name: "Creme Desodorante Nutritivo para o Corpo Tododia Amora Vermelha e Jabuticaba",
    price: "R$ 50,90",
    description: "Pele mais firme e macia com um toque frutal.",
    url: "https://www.natura.com.br/p/creme-desodorante-nutritivo-para-o-corpo-tododia-amora-vermelha-e-jabuticaba-400-ml/NATBRA-88103?position=2&listTitle=search+results+list+showcase+-+tododia+amora&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dwa9e01279/Produtos/PRODUTO/NATBRA-146478_2.jpg",
    name: "Caneta Delineadora para Olhos Una",
    price: "R$ 49,90",
    description: "Delineado fácil, preciso e ultrapigmentado.",
    url: "https://www.natura.com.br/p/caneta-delineadora-para-olhos-una/NATBRA-146478?position=6&listTitle=search+results+list+showcase+-+caneta+delineadora+una&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw0ff3cfde/NATBRA-167241_2.jpg",
    name: "Natura Homem Aromáticos",
    price: "R$ 128,90",
    description: "Fragrância feita para renovar seu dia a dia.",
    url: "https://www.natura.com.br/p/natura-homem-aromaticos-100-ml/NATBRA-167241?position=1&listTitle=search+results+list+showcase+-+homem+arom%C3%A1ticos&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw1f484e81/Produtos/PRODUTO/NATBRA-95560_2.jpg",
    name: "Essencial Supreme Masculino 100 ml",
    price: "R$ 182,90",
    description: "Deo Parfum Natura Essencial Supreme: uma Expressão de intensidade.",
    url: "https://www.natura.com.br/p/desodorante-perfume-essencial-supreme-masculino-100-ml/NATBRA-95560?position=1&listTitle=search+results+list+showcase+-+essencial+supreme&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw7d5b57a1/Produtos/NATBRA-72468_3.jpg",
    name: "K Max Masculino 100 ml",
    price: "R$ 184,90",
    description: "Natura K Max: A fragrância intensa para homens de espírito livre.",
    url: "https://www.natura.com.br/p/desodorante-perfume-k-max-masculino-100-ml/NATBRA-72468?position=2&listTitle=search+suggest+showcase+-+produtos+sugeridos%3A&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw5bfa48d4/Produtos/PRODUTO/NATBRA-108406_2.jpg",
    name: "Kaiak Vital Masculino 100 ml",
    price: "R$ 119,90",
    description: "Sinta a força revitalizante.",
    url: "https://www.natura.com.br/p/desodorante-colonia-kaiak-vital-masculino-100-ml/NATBRA-108406?position=1&listTitle=search+results+list+showcase+-+kaiak+vital&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dwcbaed28a/NATBRA-108402_2.jpg",
    name: "Kaiak Aventura Masculino 100 ml",
    price: "R$ 119,90",
    description: "Sinta a agitação das corredeiras com o desodorante Kaiak Aventura.",
    url: "https://www.natura.com.br/p/desodorante-colonia-kaiak-aventura-masculino-100-ml/NATBRA-108402?position=1&listTitle=search+suggest+showcase+-+produtos+sugeridos%3A&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw9f85b482/NATBRA-71773_1.jpg",
    name: "Sintonia Impacto Masculino 100 ml",
    price: "R$ 159,90",
    description: "Sintonia Impacto: conectado do seu jeito.",
    url: "https://www.natura.com.br/p/desodorante-colonia-sintonia-impacto-masculino-100-ml/NATBRA-71773?position=1&listTitle=search+results+list+showcase+-+Sintonia+Impacto+Masculino+100+ml&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw894ec160/NATBRA-110411_3.jpg",
    name: "Biografia Encontros Masculino 100 ml",
    price: "R$ 149,90",
    description: "Uma fragrância exclusiva para você fazer a sua história.",
    url: "https://www.natura.com.br/p/biografia-encontros-masculino-100-ml/NATBRA-110411?position=1&listTitle=search+results+list+showcase+-+Biografia+Encontros+Masculino+100+ml&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw3294b93d/Produtos/NATBRA-122928_2.jpg",
    name: "Humor Transforma 75 ml",
    price: "R$ 99,90",
    description: "Humor Transforma 75 ml.",
    url: "https://www.natura.com.br/p/desodorante-colonia-humor-transforma-75-ml/NATBRA-122928?position=1&listTitle=search+suggest+showcase+-+produtos+sugeridos%3A&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dwacb9e061/NATBRA-131462_2.jpg",
    name: "Festival de Humor Feminino 75 ml",
    price: "R$ 99,90",
    description: "Uma fragrância que pulsa na frequência da alegria coletiva.",
    url: "https://www.natura.com.br/p/desodorante-colonia-festival-de-humor-feminino-75-ml/NATBRA-131462?position=1&listTitle=search+suggest+showcase+-+produtos+sugeridos%3A&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dwd687149e/Produtos/PRODUTO/NATBRA-95947_2.jpg",
    name: "Beijo de Humor Feminino 75 ml",
    price: "R$ 99,90",
    description: "Beijo de Humor Natura feminino: um convite à uma vida mais ousada e divertida.",
    url: "https://www.natura.com.br/p/desodorante-colonia-beijo-de-humor-feminino-75-ml/NATBRA-95947?position=1&listTitle=search+suggest+showcase+-+produtos+sugeridos%3A&consultoria=claudio211015cruzsantos"
  },
  {
    image: "https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dwf63db4cb/Produtos/NATBRA-114583_2.jpg",
    name: "Essencial Ato Feminino 100 ml",
    price: "R$ 182,90",
    description: "Natura Essencial Ato: fragrância única e luminosa.",
    url: "https://www.natura.com.br/p/desodorante-perfume-essencial-ato-feminino-100-ml/NATBRA-114583?position=1&listTitle=search+results+list+showcase+-+Essencial+Ato+Feminino+100+ml&consultoria=claudio211015cruzsantos"
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
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-dark text-center mb-12">
            Produtos em Promoção
          </h2>
          <p className="text-1x1 md:text-1x1 font-poppins text-dark text-center mb-12">
            Promoções válidas entre 13/02 à 04/03
          </p>
          <ProductCarousel products={products} />
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
      <footer id="contact" className="bg-dark text-white py-6">
        <div className="container mx-auto px-4  text-center text-gray-400">
          
            <p>&copy; 2025 Claudio Cruz Santos - Revenda Natura. Todos os direitos reservados.</p>
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