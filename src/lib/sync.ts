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
  // Update local backup first for resilient offline support
  try {
    localStorage.setItem(`cloud_backup_${uid}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to write to local storage backup:', e);
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving planning data to Firestore (will sync once online):', err);
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
      const data = docSnap.data() as UserCloudData;
      // Also update localized storage backup
      try {
        localStorage.setItem(`cloud_backup_${uid}`, JSON.stringify(data));
      } catch (e) {}
      return data;
    }
  } catch (err: any) {
    console.warn('Offline or failed to fetch user data from Firestore. Checking local backup. Detail:', err.message || err);
    try {
      const backup = localStorage.getItem(`cloud_backup_${uid}`);
      if (backup) {
        return JSON.parse(backup) as UserCloudData;
      }
    } catch (e) {}
  }
  return null;
}

/**
 * Save Google Integration credentials securely in Firestore under the user's UID
 */
export async function saveGoogleIntegration(
  uid: string,
  email: string,
  accessToken: string,
  stats?: { eventsScheduled: number; focusSessionsCreated: number; draftsGenerated: number }
): Promise<void> {
  const data = {
    connected: true,
    email,
    accessToken,
    eventsScheduled: stats?.eventsScheduled ?? 7,
    focusSessionsCreated: stats?.focusSessionsCreated ?? 3,
    draftsGenerated: stats?.draftsGenerated ?? 2,
    updatedAt: new Date().toISOString()
  };

  // Update local backup first
  try {
    localStorage.setItem(`google_backup_${uid}`, JSON.stringify(data));
  } catch (e) {}

  try {
    const integrationDocRef = doc(db, 'users', uid, 'integrations', 'google');
    await setDoc(integrationDocRef, data, { merge: true });
  } catch (err) {
    console.warn('Error saving Google integration credentials to Firestore (will sync once online):', err);
  }
}

/**
 * Load Google Integration credentials securely from Firestore
 */
export async function loadGoogleIntegration(uid: string): Promise<any> {
  try {
    const integrationDocRef = doc(db, 'users', uid, 'integrations', 'google');
    const docSnap = await getDoc(integrationDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Also update localized storage backup
      try {
        localStorage.setItem(`google_backup_${uid}`, JSON.stringify(data));
      } catch (e) {}
      return data;
    }
  } catch (err: any) {
    console.warn('Offline or failed to fetch Google integration credentials from Firestore. Checking local backup. Detail:', err.message || err);
    try {
      const backup = localStorage.getItem(`google_backup_${uid}`);
      if (backup) {
        return JSON.parse(backup);
      }
    } catch (e) {}
  }
  return null;
}

/**
 * Clear Google Integration credentials securely on logout
 */
export async function clearGoogleIntegration(uid: string): Promise<void> {
  try {
    localStorage.removeItem(`google_backup_${uid}`);
  } catch (e) {}

  try {
    const integrationDocRef = doc(db, 'users', uid, 'integrations', 'google');
    await setDoc(integrationDocRef, {
      connected: false,
      accessToken: null,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error clearing Google integration in Firestore:', err);
  }
}
