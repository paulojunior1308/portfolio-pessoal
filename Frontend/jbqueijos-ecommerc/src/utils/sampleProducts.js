import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const sampleProducts = [
  {
    name: "Queijo Minas Artesanal",
    brand: "JB Queijos",
    price: 45.90,
    unit: "kg",
    imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=2073",
    description: "Queijo minas artesanal tradicional, maturado por 21 dias"
  },
  {
    name: "Queijo Canastra",
    brand: "JB Queijos",
    price: 89.90,
    unit: "kg",
    imageUrl: "https://images.unsplash.com/photo-1634487359989-3e90c9432133?auto=format&fit=crop&q=80&w=2069",
    description: "Premiado queijo da Serra da Canastra, maturação especial"
  },
  {
    name: "Gorgonzola Nacional",
    brand: "JB Queijos",
    price: 98.90,
    unit: "kg",
    imageUrl: "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80&w=2069",
    description: "Gorgonzola cremoso com sabor intenso e textura única"
  },
  {
    name: "Queijo Coalho",
    brand: "JB Queijos",
    price: 39.90,
    unit: "kg",
    imageUrl: "https://images.unsplash.com/photo-1624806992066-5ffcf7ca186b?auto=format&fit=crop&q=80&w=2070",
    description: "Ideal para churrasco, grelhados e receitas especiais"
  },
  {
    name: "Parmesão Artesanal",
    brand: "JB Queijos",
    price: 129.90,
    unit: "kg",
    imageUrl: "https://images.unsplash.com/photo-1637604084131-0e1cf5d2f5b7?auto=format&fit=crop&q=80&w=2072",
    description: "Parmesão premium maturado por 24 meses"
  },
  {
    name: "Requeijão Cremoso",
    brand: "JB Queijos",
    price: 24.90,
    unit: "pote 500g",
    imageUrl: "https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&q=80&w=2067",
    description: "Requeijão cremoso tradicional, ideal para passar"
  }
];

export const addSampleProducts = async () => {
  try {
    for (const product of sampleProducts) {
      await addDoc(collection(db, 'products'), product);
    }
    console.log('Produtos de exemplo adicionados com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar produtos:', error);
  }
};