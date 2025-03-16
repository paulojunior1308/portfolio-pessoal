import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { nanoid } from 'nanoid';

// Gera um token único para compartilhamento
export const generateShareToken = () => nanoid(32);

// Salva o token no Firestore
export const createShareToken = async (projectId: string) => {
  try {
    const token = generateShareToken();
    const projectRef = doc(db, 'projects', projectId);
    
    await updateDoc(projectRef, {
      shareToken: token,
      shareTokenCreatedAt: new Date().toISOString()
    });

    return token;
  } catch (error) {
    console.error('Erro ao criar token de compartilhamento:', error);
    throw new Error('Não foi possível criar o link de compartilhamento');
  }
};

// Valida o token de compartilhamento
export const validateShareToken = async (projectId: string, token: string) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) {
      return false;
    }

    const data = projectDoc.data();
    
    // Verifica se o token existe e corresponde
    if (!data.shareToken || data.shareToken !== token) {
      return false;
    }

    // Verifica se o token não expirou (opcional - 7 dias de validade)
    const tokenCreatedAt = new Date(data.shareTokenCreatedAt);
    const now = new Date();
    const diffDays = (now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays > 7) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return false;
  }
}; 