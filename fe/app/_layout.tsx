import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/authContext';
import { WalletProvider } from '../context/walletContext';
import { CertificateProvider } from '../context/certificateContext';
import { StatusBar } from 'expo-status-bar';
import { AppKitProvider, AppKit } from '@reown/appkit-react-native';
import { appKit } from '@/config/appKitConfig';

function RootLayoutNav() {
  const auth = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!auth?.loading) {
      // App is initialized
      const inProtectedGroup = segments[0] === '(app)';
      if (!auth?.session && inProtectedGroup) {
        router.replace('/signin');
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
      <AppKitProvider instance={appKit}>
        <WalletProvider>
          <CertificateProvider>
            <RootLayoutNav />
            <StatusBar style="dark" />
            <AppKit />
          </CertificateProvider>
        </WalletProvider>
      </AppKitProvider>
    </AuthProvider>
  );
}