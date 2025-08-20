import { getDatabase, ref, get, set, push, update, remove, onValue, off } from 'firebase/database';
import { app } from './firebaseConfig';

const database = getDatabase(app);

// User operations
export const getUserByUid = async (uid) => {
  try {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    // Re-throw with more specific error information
    if (error.code === 'PERMISSION_DENIED') {
      throw new Error('Permission denied: Unable to access user data. Please check Firebase security rules.');
    }
    throw error;
  }
};

export const createUser = async (uid, userData) => {
  const userRef = ref(database, `users/${uid}`);
  await set(userRef, userData);
};

export const updateUser = async (uid, userData) => {
  const userRef = ref(database, `users/${uid}`);
  await update(userRef, userData);
};

// Generic database operations
export const getData = async (path) => {
  const dataRef = ref(database, path);
  const snapshot = await get(dataRef);
  return snapshot.exists() ? snapshot.val() : null;
};

export const setData = async (path, data) => {
  const dataRef = ref(database, path);
  await set(dataRef, data);
};

export const updateData = async (path, data) => {
  const dataRef = ref(database, path);
  await update(dataRef, data);
};

export const pushData = async (path, data) => {
  const dataRef = ref(database, path);
  const newRef = push(dataRef);
  await set(newRef, data);
  return newRef.key;
};

export const removeData = async (path) => {
  const dataRef = ref(database, path);
  await remove(dataRef);
};

// Real-time listeners
export const subscribeToData = (path, callback) => {
  const dataRef = ref(database, path);
  onValue(dataRef, callback);
  return () => off(dataRef, 'value', callback);
};

export { database };