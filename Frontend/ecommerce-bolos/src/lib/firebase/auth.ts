import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '../../types';

export const createUser = async (
  email: string,
  password: string,
  userData: Omit<User, 'id' | 'role'>
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Criar documento do usuário no Firestore
  const newUser = {
    ...userData,
    id: user.uid,
    role: 'CLIENT' as const, // Usuários novos sempre são CLIENT por padrão
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'users', user.uid), newUser);

  return newUser;
};

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  
  if (!userDoc.exists()) {
    throw new Error('Usuário não encontrado no banco de dados');
  }

  return userDoc.data() as User;
};

export const signOut = () => firebaseSignOut(auth);

export const initializeAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          callback(userDoc.data() as User);
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};