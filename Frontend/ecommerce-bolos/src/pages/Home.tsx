import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div 
        className="relative h-[600px] bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1486427944299-d1955d23e34d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="font-playfair text-5xl md:text-6xl mb-6">
              Doces e Bolos Gourmet para Todos os Momentos Especiais
            </h1>
            <p className="text-xl mb-8">
              Feitos com ingredientes selecionados e muito carinho.
            </p>
            <Link 
              to="/products" 
              className="btn btn-primary inline-flex items-center"
            >
              Confira Nossos Produtos
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="py-16 bg-beige">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center mb-12">Nossas Categorias</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Bolos Artesanais',
                image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
              },
              {
                title: 'Doces Gourmet',
                image: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-lwn6b7zkw2vmd2',
              },
              {
                title: 'Cupcakes',
                image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
              },
            ].map((category, index) => (
              <Link 
                key={index}
                to="/products" 
                className="group relative h-64 rounded-lg overflow-hidden"
              >
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-playfair">{category.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}