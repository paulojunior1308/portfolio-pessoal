import { motion } from 'framer-motion';

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  description: string;
}

export default function ProductCard({ image, name, price, description }: ProductCardProps) {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg overflow-hidden"
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
      <div className="p-4">
        <h3 className="font-poppins font-semibold text-lg text-dark">{name}</h3>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-primary font-semibold text-lg">{price}</span>
        </div>
      </div>
    </motion.div>
  );
}