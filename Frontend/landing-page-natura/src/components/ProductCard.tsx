import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  description: string;
  url: string;
}

export default function ProductCard({ image, name, price, description, url }: ProductCardProps) {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-square">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-poppins font-semibold text-lg text-dark line-clamp-2 mb-2">{name}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2 flex-1">{description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-primary font-semibold text-lg">{price}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center space-x-2 px-4 py-2"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Comprar</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}