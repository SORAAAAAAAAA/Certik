import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { 
  Upload, 
  FileText, 
  Plus, 
  X, 
  Shield, 
  Award, 
  CheckCircle,
  TrendingUp,
  Users,
  Lock
} from 'lucide-react-native';
import Header from '@/components/ui/Header';

export default function Home() {
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const handleSubmit = () => {
    console.log({
      title,
      issuer,
      description,
      date,
      file,
    });
    // Reset form and close modal
    setModalVisible(false);
    setTitle('');
    setIssuer('');
    setDescription('');
    setDate('');
    setFile(null);
  };

  const stats = [
    { label: 'Certificates', value: '12', icon: Award },
    { label: 'Verified', value: '100%', icon: CheckCircle },
    { label: 'On-Chain', value: '12', icon: Lock },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Blockchain Verified',
      description: 'Every certificate is cryptographically secured on the blockchain',
      color: '#6366f1',
    },
    {
      icon: Lock,
      title: 'Immutable Records',
      description: 'Your credentials cannot be altered or tampered with',
      color: '#8b5cf6',
    },
    {
      icon: Users,
      title: 'Easy Sharing',
      description: 'Share your verified certificates with anyone, anywhere',
      color: '#06b6d4',
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Build your professional profile with verifiable credentials',
      color: '#10b981',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Welcome to Certik</Text>
          <Text style={styles.heroSubtitle}>
            Secure your certificates on blockchain. Verify credentials instantly.
          </Text>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Plus size={20} color="#6366f1" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Add Certificate</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <stat.icon size={20} color="#6366f1" strokeWidth={2} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Certik?</Text>
          
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                <feature.icon size={24} color={feature.color} strokeWidth={2} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <Award size={28} color="#6366f1" strokeWidth={2} />
              <Text style={styles.actionText}>View All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <Shield size={28} color="#8b5cf6" strokeWidth={2} />
              <Text style={styles.actionText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Add Certificate Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Certificate</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Title */}
              <View style={styles.field}>
                <Text style={styles.label}>Certificate Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. React Native Fundamentals"
                  placeholderTextColor="#9ca3af"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Issuer */}
              <View style={styles.field}>
                <Text style={styles.label}>Issuer</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Academy"
                  placeholderTextColor="#9ca3af"
                  value={issuer}
                  onChangeText={setIssuer}
                />
              </View>

              {/* Description */}
              <View style={styles.field}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="What does this certificate represent?"
                  placeholderTextColor="#9ca3af"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
              </View>

              {/* Date */}
              <View style={styles.field}>
                <Text style={styles.label}>Completion Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                  value={date}
                  onChangeText={setDate}
                />
              </View>

              {/* File Upload */}
              <View style={styles.field}>
                <Text style={styles.label}>Certificate File</Text>

                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={pickFile}
                  activeOpacity={0.85}
                >
                  <Upload size={22} color="#6366f1" />
                  <Text style={styles.uploadText}>
                    {file ? 'Change file' : 'Upload image or PDF'}
                  </Text>
                </TouchableOpacity>

                {file && (
                  <View style={styles.filePreview}>
                    <FileText size={16} color="#6b7280" />
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </Text>
                  </View>
                )}
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.85}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Save Certificate</Text>
              </TouchableOpacity>

              <Text style={styles.helper}>
                File and metadata will be hashed and stored on-chain.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scroll: {
    paddingBottom: 96,
  },

  // Hero Section
  hero: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 40,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    marginBottom: 24,
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366f1',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  // Section
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  // Features
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },

  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    padding: 24,
    paddingBottom: 40,
  },

  // Form Fields
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#111827',
  },
  textArea: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  uploadBox: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },

  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  fileName: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },

  button: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  helper: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
  },
});