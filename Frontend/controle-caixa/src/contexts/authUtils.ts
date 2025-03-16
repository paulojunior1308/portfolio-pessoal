import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

export const login = async (username: string, password: string): Promise<void> => {
  try {
    const email = username.includes('@') ? username : `${username}@scholarship.app`;
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      if ('code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/invalid-email' || firebaseError.code === 'auth/user-not-found') {
          throw new Error('Invalid username or password');
        } else if (firebaseError.code === 'auth/wrong-password') {
          throw new Error('Invalid password');
        }
      }
      throw new Error('Failed to sign in. Please try again.');
    }
    throw error;
  }
};

export const signOut = () => firebaseSignOut(auth); 