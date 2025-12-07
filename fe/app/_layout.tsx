import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/authContext'; 
import { StatusBar } from 'expo-status-bar';

function RootLayoutNav() {
  const auth = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!auth?.loading) {
      // App is initialized
      const inProtectedGroup = segments[0] === '(app)'; 
      if (!auth?.session && inProtectedGroup) {
        router.replace('/signup');
      } else if (auth?.session && !inProtectedGroup) {
        router.replace('/(app)/(tabs)/home');
      }
    }
  }, [auth?.loading, auth?.session, router, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
      <StatusBar style="dark" />
    </AuthProvider>
  );
}