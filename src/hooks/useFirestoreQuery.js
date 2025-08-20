import { useState, useEffect } from 'react';
import { subscribeToData } from '../firebase/db';

export const useFirestoreQuery = (path) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) return;

    setLoading(true);
    const unsubscribe = subscribeToData(path, (snapshot) => {
      try {
        const value = snapshot.val();
        setData(value);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [path]);

  return { data, loading, error };
};