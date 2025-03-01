import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, Trash2, X, Camera } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import type { Product } from '../types';
import { Html5Qrcode } from 'html5-qrcode';

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    barcode: '',
    price: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCode = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: newProduct.name.trim(),
        barcode: newProduct.barcode.trim(),
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      const newProductId = docRef.id;
      setNewProduct({ ...newProduct, id: newProductId });
      
      setShowAddModal(false);
      setNewProduct({ id: '', name: '', barcode: '', price: '', quantity: '' });
      await fetchProducts();
      toast.success('Produto adicionado com sucesso');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Erro ao adicionar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setLoading(true);

    try {
      const productRef = doc(db, 'products', editingProduct.id);
      await updateDoc(productRef, {
        name: editingProduct.name.trim(),
        barcode: editingProduct.barcode.trim(),
        price: parseFloat(editingProduct.price.toString()),
        quantity: parseInt(editingProduct.quantity.toString()),
        updatedAt: serverTimestamp()
      });
      
      setEditingProduct(null);
      await fetchProducts();
      toast.success('Produto atualizado com sucesso');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Erro ao atualizar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      await fetchProducts();
      toast.success('Produto excluído com sucesso');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const startScanner = async () => {
    try {
      setIsScanning(true);
      
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!html5QrCode.current) {
        html5QrCode.current = new Html5Qrcode("reader", {
          verbose: true,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        });
      }

      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        // Procura especificamente por câmera traseira
        const rearCamera = devices.find(
          device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('traseira') || 
            device.label.toLowerCase().includes('environment')
        );
        
        // Se não encontrar a câmera traseira, pega a última câmera da lista (geralmente é a traseira)
        const cameraId = rearCamera ? rearCamera.id : devices[devices.length - 1].id;
        
        await html5QrCode.current.start(
          cameraId,
          {
            fps: 20,
            qrbox: { width: 250, height: 100 },
            aspectRatio: 2.0,
            disableFlip: false,
          },
          async (decodedText) => {
            console.log('Código lido:', decodedText);
            setNewProduct(prev => ({ ...prev, barcode: decodedText }));
            stopScanner();
            toast.success('Código de barras lido com sucesso!');
          },
          (errorMessage) => {
            if (errorMessage.includes('NotFoundError')) {
              toast.error('Câmera não encontrada');
              stopScanner();
            }
          }
        );

      } else {
        toast.error('Nenhuma câmera encontrada');
        setIsScanning(false);
      }
    } catch (err) {
      console.error('Error starting scanner:', err);
      toast.error('Erro ao iniciar câmera');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCode.current && html5QrCode.current.isScanning) {
        await html5QrCode.current.stop();
      }
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
    setIsScanning(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  return (
    <Layout title="Produtos">
      <div className="bg-white rounded-xl shadow-md p-6 font-poppins">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acai-primary"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-acai-primary text-white rounded-lg hover:bg-acai-secondary transition-colors duration-200 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            Novo Produto
          </button>
        </div>

        <div className="overflow-x-auto -mx-4 sm:-mx-6">
          <div className="inline-block min-w-full align-middle px-4 sm:px-6">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                    Nome
                  </th>
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 hidden sm:table-cell">
                    Código de Barras
                  </th>
                  <th className="px-3 py-3 text-right text-xs sm:text-sm font-semibold text-gray-600">
                    Preço
                  </th>
                  <th className="px-3 py-3 text-right text-xs sm:text-sm font-semibold text-gray-600">
                    Estoque
                  </th>
                  <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold text-gray-600">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-3 py-3 text-xs sm:text-sm text-gray-800">
                      {product.name}
                    </td>
                    <td className="px-3 py-3 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                      {product.barcode}
                    </td>
                    <td className="px-3 py-3 text-xs sm:text-sm text-gray-800 text-right">
                      {product.price.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="px-3 py-3 text-xs sm:text-sm text-gray-800 text-right">
                      {product.quantity}
                    </td>
                    <td className="px-3 py-3 text-xs sm:text-sm">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-acai-primary font-pacifico">Novo Produto</h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  stopScanner();
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acai-primary"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Barras
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acai-primary"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => isScanning ? stopScanner() : startScanner()}
                    className="p-2 rounded-lg bg-acai-primary text-white hover:bg-acai-secondary transition-colors"
                    disabled={loading}
                  >
                    {isScanning ? <X className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                  </button>
                </div>
                {isScanning && (
                  <div className="mt-4">
                    <div id="reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-white"></div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acai-primary"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acai-primary"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-acai-primary text-white rounded-lg hover:bg-acai-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adicionando...' : 'Adicionar Produto'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-acai-primary font-pacifico">Editar Produto</h2>
              <button 
                onClick={() => setEditingProduct(null)}
                className="text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acai-primary"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Barras
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.barcode}
                  onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acai-primary"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acai-primary"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editingProduct.quantity}
                  onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acai-primary"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-acai-primary text-white rounded-lg hover:bg-acai-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}