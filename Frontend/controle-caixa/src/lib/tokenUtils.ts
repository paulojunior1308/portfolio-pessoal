import { nanoid } from 'nanoid';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Generate a unique token for sharing
export const generateShareToken = () => {
  return nanoid(16); // Generates a 16-character token
};

// Save the token to the project document
export const saveShareToken = async (projectId: string, token: string) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      shareToken: token,
      shareTokenCreatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

// Validate if the token is valid for the project
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
    console.error('Error validating token:', error);
    return false;
  }
};