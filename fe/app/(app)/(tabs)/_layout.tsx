import { Tabs } from 'expo-router';
import { Home, Award, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';

export default function TabLayout() {
  return (

    <>
      <SafeAreaView
        edges={['top']}
        style={{ backgroundColor: '#ffffff' }}
      >
        <Header />
      </SafeAreaView>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#999',
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
            headerTitle: 'Home',
          }}
        />
        <Tabs.Screen
          name="certificates"
          options={{
            title: 'Certificates',
            tabBarIcon: ({ color }) => <Award size={24} color={color} />,
            headerTitle: 'Certificates',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
            headerTitle: 'Profile',
          }}
        />
      </Tabs>
      </>
  );
}
