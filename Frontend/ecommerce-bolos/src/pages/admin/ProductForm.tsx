import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { Product } from '../../types';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'Bolos'
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({
            id: docSnap.id,
            ...data,
            price: Number(data.price)
          } as Product);
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        toast.error('Erro ao carregar produto');
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = { ...product, price: Number(product.price) || 0 };
      if (id) {
        await setDoc(doc(db, 'products', id), productData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'products'), productData);
        toast.success('Produto criado com sucesso!');
      }
      navigate('/admin/products');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  // Ativar a câmera
  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
      toast.error('Erro ao acessar a câmera');
    }
  };

  // Capturar a imagem da câmera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageUrl = canvasRef.current.toDataURL('image/png'); // Converte para URL Base64
        setProduct({ ...product, image: imageUrl });
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-playfair mb-8">
        {id ? 'Editar Produto' : 'Novo Produto'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome
          </label>
          <input
            type="text"
            id="name"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            required
            className="input"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            id="description"
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            required
            className="input min-h-[100px]"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Preço
          </label>
          <input
            type="number"
            id="price"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
            required
            min="0"
            step="0.01"
            className="input"
          />
        </div>

        {/* Captura de imagem */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Imagem do Produto
          </label>
          {product.image ? (
            <img src={product.image} alt="Produto" className="w-48 h-48 object-cover rounded-md mt-2" />
          ) : (
            <p className="text-gray-500 text-sm">Nenhuma imagem selecionada</p>
          )}
          <div className="mt-4 space-x-2">
            <button type="button" onClick={startCamera} className="btn btn-secondary">
              Tirar Foto
            </button>
            {cameraActive && (
              <button type="button" onClick={captureImage} className="btn btn-primary">
                Capturar Imagem
              </button>
            )}
          </div>
          {/* Elementos para câmera */}
          {cameraActive && (
            <div className="mt-4">
              <video ref={videoRef} autoPlay className="w-full max-w-sm border rounded-md" />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Categoria
          </label>
          <select
            id="category"
            value={product.category}
            onChange={(e) => setProduct({ ...product, category: e.target.value })}
            required
            className="input"
          >
            <option value="Bolos">Bolos</option>
            <option value="Doces">Doces</option>
            <option value="Cupcakes">Cupcakes</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => navigate('/admin/products')} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary flex-1">
            {loading ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
}
