import { nanoid } from 'nanoid';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Gera um token único para compartilhamento
export const generateShareToken = () => {
  return nanoid(16); // Gera um token de 16 caracteres
};

// Salva o token no documento do projeto
export const saveShareToken = async (projectId: string, token: string) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      shareToken: token,
      shareTokenCreatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Erro ao salvar token:', error);
    return false;
  }
};

// Valida se o token é válido para o projeto
export const validateShareToken = async (projectId: string, token: string) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      return false;
    }

    const data = projectDoc.data();
    return data.shareToken === token;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return false;
  }
};