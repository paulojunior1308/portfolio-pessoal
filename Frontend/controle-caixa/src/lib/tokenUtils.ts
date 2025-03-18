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
      shareTokenCreatedAt: new Date().toISOString(),
      shareTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
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
    
    // Check if token matches and hasn't expired
    if (data.shareToken !== token) {
      return false;
    }

    const expiresAt = new Date(data.shareTokenExpiresAt);
    if (expiresAt < new Date()) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};