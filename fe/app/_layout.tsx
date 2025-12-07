import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/authContext'; 
import { StatusBar } from 'expo-status-bar';

function RootLayoutNav() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth?.loading) {
      // App is initialized
      if (!auth?.session) {
        router.replace('/');
      } else if (auth?.session) {
        router.replace('/(app)/(tabs)/home');
      }
    }
  }, [auth?.loading, auth?.session, router]);

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