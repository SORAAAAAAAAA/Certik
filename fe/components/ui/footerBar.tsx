import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Award, User } from 'lucide-react-native';

const FOOTER_ITEMS = [
  { label: 'Home', icon: Home, path: '/home' },
  { label: 'Certificates', icon: Award, path: '/certificates' },
  { label: 'Profile', icon: User, path: '/profile' },
];

export default function FooterBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {FOOTER_ITEMS.map(({ label, icon: Icon, path }) => {
        const isActive = pathname === path;

        return (
          <TouchableOpacity
            key={path}
            style={styles.item}
            onPress={() => router.replace(path)}
            activeOpacity={0.7}
          >
            <Icon
              size={22}
              color={isActive ? '#6366f1' : '#9ca3af'}
            />
            <Text
              style={[
                styles.label,
                isActive && styles.activeLabel,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  activeLabel: {
    color: '#6366f1',
  },
});
