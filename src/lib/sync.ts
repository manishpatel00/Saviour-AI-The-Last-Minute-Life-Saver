import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './auth';
import { Task, Goal, Badge, UserStats, AppNotification } from '../types';

interface UserCloudData {
  tasks: Task[];
  goals: Goal[];
  badges: Badge[];
  stats: UserStats;
  notifications: AppNotification[];
}

/**
 * Save all planning data to Firestore securely under the user's UID
 */
export async function saveUserDataToCloud(uid: string, data: UserCloudData): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving planning data to Firestore:', err);
  }
}

/**
 * Load planning data from Firestore securely under the user's UID
 */
export async function loadUserDataFromCloud(uid: string): Promise<UserCloudData | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserCloudData;
    }
  } catch (err) {
    console.error('Error loading planning data from Firestore:', err);
  }
  return null;
}
