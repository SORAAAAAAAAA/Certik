import { View, Text, StyleSheet } from 'react-native';
import { Award } from 'lucide-react-native';

interface HeaderProps {
  showTagline?: boolean;
}

export default function Header({ showTagline = true }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brandContainer}>
        <View>
          <Text style={styles.brandName}>Certik</Text>
          {showTagline && (
            <Text style={styles.tagline}>Blockchain Certificates</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
  width: '100%',
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 16,
  backgroundColor: '#ffffff',
  borderBottomWidth: 1,
  borderBottomColor: '#f3f4f6',
},
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6366f1',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: -2,
    fontWeight: '500',
  },
});