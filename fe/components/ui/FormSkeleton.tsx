import { View, StyleSheet } from 'react-native';

export default function FormSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.label} />
      <View style={styles.input} />

      <View style={styles.label} />
      <View style={styles.input} />

      <View style={styles.label} />
      <View style={styles.input} />

      <View style={styles.label} />
      <View style={styles.input} />

      <View style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 16,
  },
  label: {
    width: 120,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: '#e5e7eb',
    borderRadius: 14,
    marginTop: 8,
  },
});
