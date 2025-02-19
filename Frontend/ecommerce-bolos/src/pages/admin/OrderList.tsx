import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExtendedOrder extends Order {
  userName: string;
  userPhone: string;
}

export default function OrderList() {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<ExtendedOrder[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const ordersPromises = snapshot.docs.map(async (orderDoc) => {
          const orderData = orderDoc.data() as Order;
          const userDocRef = doc(db, 'users', orderData.userId);
          const userDocSnap = await getDoc(userDocRef);
          const userData = userDocSnap.data();
          
          return {
            ...orderData,
            id: orderDoc.id,
            userName: userData?.name || 'Usuário não encontrado',
            userPhone: userData?.phone || 'Telefone não encontrado'
          };
        });

        const ordersData = await Promise.all(ordersPromises);
        setOrders(ordersData);
        setFilteredOrders(ordersData);
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        toast.error('Erro ao carregar pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userPhone.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'completed') => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast.success('Status do pedido atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      toast.error('Erro ao atualizar status do pedido');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <p className="text-center">Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-playfair mb-8">Gerenciar Pedidos</h1>

      <div className="mb-8 relative">
        <input
          type="text"
          placeholder="Pesquisar por ID do pedido, nome do cliente ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-playfair text-xl">Pedido #{order.id.slice(-6)}</h3>
                <p className="text-gray-600">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value as 'pending' | 'completed')}
                className="input bg-white border-2 border-gray-300"
              >
                <option value="pending">Pendente</option>
                <option value="completed">Concluído</option>
              </select>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Cliente</h4>
              <p>Nome: {order.userName}</p>
              <p>Telefone: {order.userPhone}</p>
              <p>Endereço: {order.address}</p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Forma de Pagamento</h4>
              <p>{order.paymentMethod}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Itens do Pedido</h4>
              {order.items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center mb-2">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                <span>Total</span>
                <span>R$ {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <p className="text-center text-gray-600 mt-8">
          Nenhum pedido encontrado.
        </p>
      )}
    </div>
  );
}