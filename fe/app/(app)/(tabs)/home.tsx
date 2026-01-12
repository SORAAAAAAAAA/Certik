import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Linking,
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
  Lock,
  ExternalLink,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '@/context/walletContext';
import { useCertificates } from '@/context/certificateContext';
import { useCertificateUpload } from '@/hooks/useCertificateUpload';
import { ImageSource } from '@/types/certificate';
import { mintWithPrivateKey, MintProgress } from '@/utils/blockchain/certificate.service';

export default function Home() {
  const router = useRouter();
  const { isWalletConnected, walletAddress } = useWallet();
  const { stats, refreshCertificates } = useCertificates();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  // Pinata upload hook
  const { isUploading, progress, uploadCertificate, reset: resetUpload } = useCertificateUpload();
  
  // Minting state
  const [isMinting, setIsMinting] = useState(false);
  const [mintProgress, setMintProgress] = useState<MintProgress | null>(null);
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [mintedTxHash, setMintedTxHash] = useState<string | null>(null);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const handleConnectWallet = () => {
    router.push({ pathname: '/(app)/(tabs)/profile', params: { scrollToTop: Date.now() } });
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a certificate title');
      return;
    }
    if (!issuer.trim()) {
      Alert.alert('Error', 'Please enter the issuer name');
      return;
    }
    if (!file) {
      Alert.alert('Error', 'Please select a certificate file');
      return;
    }
    if (!walletAddress) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    // Prepare image source for Pinata
    const imageSource: ImageSource = {
      uri: file.uri,
      type: file.mimeType || 'image/png',
      name: file.name || `certificate_${Date.now()}.png`,
    };

    // Prepare certificate data
    const certificateData = {
      name: title,
      description: description || `Certificate: ${title}`,
      issuerName: issuer,
      recipientName: 'Certificate Holder',
      recipientAddress: walletAddress,
      issueDate: date || new Date().toISOString().split('T')[0],
      category: 'Certificate',
      credentialId: `CERT-${Date.now()}`,
    };

    console.log('Uploading certificate to Pinata...', certificateData);

    // Step 1: Upload to Pinata
    const uploadResult = await uploadCertificate(imageSource, certificateData);

    if (!uploadResult.success || !uploadResult.metadataUri) {
      Alert.alert('Upload Failed', uploadResult.error || 'Failed to upload certificate to IPFS');
      return;
    }

    console.log('Upload successful! Metadata URI:', uploadResult.metadataUri);

    // Step 2: Mint the certificate NFT using private key (bypasses WalletConnect)
    setIsMinting(true);
    
    try {
      console.log('[Home] Starting mint with private key...');
      
      const mintResult = await mintWithPrivateKey(
        walletAddress,
        uploadResult.metadataUri,
        setMintProgress
      );

      if (mintResult.success) {
        // Show custom success modal instead of Alert
        setMintedTokenId(mintResult.tokenId?.toString() || null);
        setMintedTxHash(mintResult.txHash || null);
        setShowSuccessModal(true);
        // Refresh certificate stats
        refreshCertificates();
      } else {
        Alert.alert(
          'Minting Failed',
          mintResult.error || 'Failed to mint certificate NFT.\n\nNote: Your metadata was uploaded to IPFS successfully. You can try minting again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Minting Error', errorMessage);
    } finally {
      setIsMinting(false);
      setMintProgress(null);
    }
  };

  const resetForm = () => {
    setModalVisible(false);
    setTitle('');
    setIssuer('');
    setDescription('');
    setDate('');
    setFile(null);
    resetUpload();
    setMintProgress(null);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setMintedTokenId(null);
    setMintedTxHash(null);
    resetForm();
  };

  const handleViewCertificates = () => {
    handleSuccessClose();
    router.push('/(app)/(tabs)/certificates');
  };

  const handleViewOnExplorer = () => {
    if (mintedTxHash) {
      const explorerUrl = `https://sepolia.basescan.org/tx/${mintedTxHash}`;
      Linking.openURL(explorerUrl);
    }
  };

  const isProcessing = isUploading || isMinting;
  const currentProgress = isMinting ? mintProgress?.message : progress?.message;
  const progressPercent = isMinting 
    ? (mintProgress?.stage === 'minting' ? 60 : mintProgress?.stage === 'confirming' ? 80 : mintProgress?.stage === 'complete' ? 100 : 50)
    : (progress?.progress || 0);

  const statsData = [
    { label: 'Certificates', value: stats.total.toString(), icon: Award },
    { label: 'Verified', value: stats.verifiedPercent, icon: CheckCircle },
    { label: 'On-Chain', value: stats.onChain.toString(), icon: Lock },
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

          {isWalletConnected ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
            >
              <Plus size={20} color="#6366f1" strokeWidth={2.5} />
              <Text style={styles.addButtonText}>Add Certificate</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnectWallet}
              activeOpacity={0.85}
            >
              <Text style={styles.connectButtonText}>Connect Wallet to Start</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats - Only show when connected */}
        {isWalletConnected && (
          <View style={styles.statsContainer}>
            {statsData.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <stat.icon size={20} color="#6366f1" strokeWidth={2} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Certik?</Text>

          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                <feature.icon size={24} color={feature.color} strokeWidth={2} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions - Only show when connected */}
        {isWalletConnected && (
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
        )}
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

              {/* Progress */}
              {isProcessing && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${progressPercent}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {currentProgress || 'Processing...'}
                  </Text>
                </View>
              )}

              {/* Submit */}
              <TouchableOpacity
                style={[styles.button, isProcessing && styles.buttonDisabled]}
                activeOpacity={0.85}
                onPress={handleSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.buttonText}>
                      {isMinting ? 'Minting...' : 'Uploading...'}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Upload & Mint NFT</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.helper}>
                Certificate will be uploaded to IPFS and minted as NFT on Base Sepolia.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            {/* Title */}
            <Text style={styles.successTitle}>Certificate Minted!</Text>
            <Text style={styles.successSubtitle}>
              Your certificate has been successfully minted as an NFT on the blockchain.
            </Text>

            {/* Token Info */}
            <View style={styles.tokenInfoCard}>
              <View style={styles.tokenInfoRow}>
                <Text style={styles.tokenInfoLabel}>Token ID</Text>
                <Text style={styles.tokenInfoValue}>#{mintedTokenId}</Text>
              </View>
              {mintedTxHash && (
                <View style={styles.tokenInfoRow}>
                  <Text style={styles.tokenInfoLabel}>Transaction</Text>
                  <Text style={styles.tokenInfoValueSmall} numberOfLines={1} ellipsizeMode="middle">
                    {mintedTxHash.slice(0, 8)}...{mintedTxHash.slice(-6)}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.successButtonsContainer}>
              <TouchableOpacity
                style={styles.successButtonPrimary}
                onPress={handleViewCertificates}
                activeOpacity={0.85}
              >
                <Award size={18} color="#ffffff" />
                <Text style={styles.successButtonPrimaryText}>View Certificates</Text>
              </TouchableOpacity>

              {mintedTxHash && (
                <TouchableOpacity
                  style={styles.successButtonSecondary}
                  onPress={handleViewOnExplorer}
                  activeOpacity={0.85}
                >
                  <ExternalLink size={16} color="#6366f1" />
                  <Text style={styles.successButtonSecondaryText}>View on Explorer</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.successButtonClose}
                onPress={handleSuccessClose}
                activeOpacity={0.85}
              >
                <Text style={styles.successButtonCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
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
  connectButton: {
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
  connectButtonText: {
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
  buttonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  progressContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  progressText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },

  helper: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
  },

  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  tokenInfoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tokenInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tokenInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  tokenInfoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
  },
  tokenInfoValueSmall: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
    fontFamily: 'monospace',
    maxWidth: 150,
  },
  successButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  successButtonPrimary: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successButtonPrimaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  successButtonSecondary: {
    backgroundColor: '#eef2ff',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successButtonSecondaryText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  successButtonClose: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  successButtonCloseText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
});