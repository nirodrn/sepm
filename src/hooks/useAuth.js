import { useState, useEffect } from 'react';
import { onAuthStateChange } from '../firebase/auth';
import { getUserByUid } from '../firebase/db';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserByUid(firebaseUser.uid);
          if (userData) {
            setUser(firebaseUser);
            setUserRole(userData);
          } else {
            // User exists in Auth but not in database - check if it's a known admin
            console.warn('User not found in database, checking for admin access');
            
            // Check if this is the admin user based on email
            if (firebaseUser.email === 'admin@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'System Administrator',
                email: firebaseUser.email,
                role: 'Admin',
                department: 'Admin',
                status: 'active'
              });
            } else if (firebaseUser.email === 'readonly@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'Read Only Admin',
                email: firebaseUser.email,
                role: 'ReadOnlyAdmin',
                department: 'Admin',
                status: 'active'
              });
            } else if (firebaseUser.email === 'whstaff@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'John Smith',
                email: firebaseUser.email,
                role: 'WarehouseStaff',
                department: 'WarehouseOperations',
                status: 'active'
              });
            } else if (firebaseUser.email === 'ho@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'Sarah Johnson',
                email: firebaseUser.email,
                role: 'HeadOfOperations',
                department: 'HeadOfOperations',
                status: 'active'
              });
            } else if (firebaseUser.email === 'md@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'Michael Director',
                email: firebaseUser.email,
                role: 'MainDirector',
                department: 'MainDirector',
                status: 'active'
              });
            } else if (firebaseUser.email === 'production@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'Emily Production',
                email: firebaseUser.email,
                role: 'ProductionManager',
                department: 'Production',
                status: 'active'
              });
            } else if (firebaseUser.email === 'packstore@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'David Pack',
                email: firebaseUser.email,
                role: 'PackingMaterialsStoreManager',
                department: 'PackingMaterialsStore',
                status: 'active'
              });
            } else if (firebaseUser.email === 'fgstore@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'Lisa Goods',
                email: firebaseUser.email,
                role: 'FinishedGoodsStoreManager',
                department: 'FinishedGoodsStore',
                status: 'active'
              });
            } else if (firebaseUser.email === 'dataentry@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'Robert Entry',
                email: firebaseUser.email,
                role: 'DataEntry',
                department: 'DataEntry',
                status: 'active'
              });
            } else if (firebaseUser.email === 'packingarea@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'Alex Packing',
                email: firebaseUser.email,
                role: 'PackingAreaManager',
                department: 'PackingArea',
                status: 'active'
              });
            } else if (firebaseUser.email === 'ho@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'Sarah Johnson',
                email: firebaseUser.email,
                role: 'HeadOfOperations',
                department: 'HeadOfOperations',
                status: 'active'
              });
            } else if (firebaseUser.email === 'md@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'Michael Director',
                email: firebaseUser.email,
                role: 'MainDirector',
                department: 'MainDirector',
                status: 'active'
              });
            } else if (firebaseUser.email === 'production@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'Emily Production',
                email: firebaseUser.email,
                role: 'ProductionManager',
                department: 'Production',
                status: 'active'
              });
            } else if (firebaseUser.email === 'packstore@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'David Pack',
                email: firebaseUser.email,
                role: 'PackingMaterialsStoreManager',
                department: 'PackingMaterialsStore',
                status: 'active'
              });
            } else if (firebaseUser.email === 'fgstore@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'Lisa Goods',
                email: firebaseUser.email,
                role: 'FinishedGoodsStoreManager',
                department: 'FinishedGoodsStore',
                status: 'active'
              });
            } else if (firebaseUser.email === 'dataentry@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'Robert Entry',
                email: firebaseUser.email,
                role: 'DataEntry',
                department: 'DataEntry',
                status: 'active'
              });
            } else if (firebaseUser.email === 'packingarea@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'Alex Packing',
                email: firebaseUser.email,
                role: 'PackingAreaManager',
                department: 'PackingArea',
                status: 'active'
              });
            } else {
              // Unknown user - default to DataEntry
              console.warn('Unknown user, defaulting to DataEntry role');
            setUser(firebaseUser);
            setUserRole({
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email,
              role: 'DataEntry', // Default role
              department: 'DataEntry',
              status: 'active'
            });
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error.message);
          
          // If it's a permission error, still allow login with basic auth data
          if (error.message.includes('Permission denied') || error.code === 'PERMISSION_DENIED') {
            console.warn('Database permission denied, using email-based role mapping');
            
            // Use email-based role mapping when database is inaccessible
            if (firebaseUser.email === 'admin@example.com') {
              setUser(firebaseUser);
              setUserRole({
                name: 'System Administrator',
                email: firebaseUser.email,
                role: 'Admin',
                department: 'Admin',
                status: 'active'
              });
            } else {
            setUser(firebaseUser);
            setUserRole({
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email,
              role: 'DataEntry', // Default role when database is inaccessible
              department: 'DataEntry',
              status: 'active'
            });
            }
          } else {
            // For other errors, clear user state
            setUser(null);
            setUserRole(null);
          }
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, userRole, loading };
};