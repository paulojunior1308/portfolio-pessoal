import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';

const auth = getAuth();

export const addProduct = async (product) => {
  if (!auth.currentUser) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const docRef = await addDoc(collection(db, 'products'), product);
    return { id: docRef.id, ...product };
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    throw error;
  }
};

export const updateProduct = async (id, product) => {
  if (!auth.currentUser) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, product);
    return { id, ...product };
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  if (!auth.currentUser) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const productRef = doc(db, 'products', id);
    await deleteDoc(productRef);
    return id;
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  }
};
