import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    orderBy
  } from 'firebase/firestore';
  import { db } from '../firebase';
  import { Order } from '../../types';
  
  export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: new Date().toISOString()
    });
  
    return {
      id: orderRef.id,
      ...orderData,
      createdAt: new Date()
    };
  };
  
  export const getUserOrders = async (userId: string) => {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
  
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  };