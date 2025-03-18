import { nanoid } from 'nanoid';
import { db } from './firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

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
    // Primeiro, busca por projetos com o token específico
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, 
      where('shareToken', '==', token),
      where('id', '==', projectId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return false;
    }

    // Verifica se o token corresponde ao projeto
    const projectDoc = querySnapshot.docs[0];
    const data = projectDoc.data();
    
    // Verifica se o token existe e corresponde
    if (!data.shareToken || data.shareToken !== token) {
      return false;
    }

    // Opcional: Verificar se o token não expirou (exemplo: 7 dias)
    const tokenCreatedAt = new Date(data.shareTokenCreatedAt).getTime();
    const now = new Date().getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    
    if (now - tokenCreatedAt > sevenDays) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return false;
  }
};