/**
 * Certificate Upload Form Component
 * Complete form for uploading certificates to IPFS via Pinata
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, ImageIcon, Upload, X, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useCertificateUpload } from '@/hooks/useCertificateUpload';
import { pickImageFromLibrary, takePhoto } from '@/utils/imagePicker';
import { CertificateInput, ImageSource } from '@/types/certificate';

interface CertificateUploadFormProps {
  recipientAddress: string;
  onUploadComplete?: (metadataUri: string) => void;
  onCancel?: () => void;
}

export default function CertificateUploadForm({
  recipientAddress,
  onUploadComplete,
  onCancel,
}: CertificateUploadFormProps) {
  const {
    isUploading,
    progress,
    result,
    uploadCertificate,
    validatePinataConnection,
    reset,
    getGatewayUrl,
  } = useCertificateUpload();

  const [isPinataReady, setIsPinataReady] = useState<boolean | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageSource | null>(null);
  const [formData, setFormData] = useState<Partial<CertificateInput>>({
    recipientAddress,
    issueDate: new Date().toISOString().split('T')[0],
  });
  const [skills, setSkills] = useState<string>('');

  // Check Pinata connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await validatePinataConnection();
      setIsPinataReady(isConnected);
    };
    checkConnection();
  }, [validatePinataConnection]);

  const handlePickImage = async () => {
    const result = await pickImageFromLibrary();
    if (result.success && result.imageSource) {
      setSelectedImage(result.imageSource);
    } else if (result.error && result.error !== 'Image selection cancelled') {
      Alert.alert('Error', result.error);
    }
  };

  const handleTakePhoto = async () => {
    const result = await takePhoto();
    if (result.success && result.imageSource) {
      setSelectedImage(result.imageSource);
    } else if (result.error && result.error !== 'Photo capture cancelled') {
      Alert.alert('Error', result.error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select a certificate image');
      return;
    }

    if (!formData.name?.trim()) {
      Alert.alert('Error', 'Please enter a certificate name');
      return;
    }

    if (!formData.issuerName?.trim()) {
      Alert.alert('Error', 'Please enter the issuer name');
      return;
    }

    if (!formData.recipientName?.trim()) {
      Alert.alert('Error', 'Please enter the recipient name');
      return;
    }

    const certificateData: CertificateInput = {
      name: formData.name.trim(),
      description: formData.description?.trim() || `Certificate: ${formData.name}`,
      issuerName: formData.issuerName.trim(),
      recipientName: formData.recipientName.trim(),
      recipientAddress: recipientAddress,
      issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
      category: formData.category?.trim(),
      credentialId: formData.credentialId?.trim() || `CERT-${Date.now()}`,
      skills: skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    };

    const uploadResult = await uploadCertificate(selectedImage, certificateData);

    if (uploadResult.success && uploadResult.metadataUri) {
      Alert.alert(
        'Success!',
        'Certificate uploaded to IPFS successfully!\n\nYou can now mint this as an NFT.',
        [
          {
            text: 'OK',
            onPress: () => onUploadComplete?.(uploadResult.metadataUri!),
          },
        ]
      );
    }
  };

  const renderProgressBar = () => {
    if (!progress) return null;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBarFill, { width: `${progress.progress}%` }]}
          />
        </View>
        <Text style={styles.progressText}>{progress.message}</Text>
      </View>
    );
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.success) {
      return (
        <View style={styles.resultContainer}>
          <CheckCircle size={24} color="#22c55e" />
          <View style={styles.resultTextContainer}>
            <Text style={styles.resultTitle}>Upload Successful!</Text>
            <Text style={styles.resultLabel}>Metadata URI (for minting):</Text>
            <Text style={styles.resultUri} selectable>
              {result.metadataUri}
            </Text>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => {
                if (result.metadataIpfsHash) {
                  Alert.alert(
                    'View on IPFS',
                    getGatewayUrl(result.metadataIpfsHash)
                  );
                }
              }}
            >
              <Text style={styles.viewButtonText}>View Metadata</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.resultContainer, styles.errorContainer]}>
        <AlertCircle size={24} color="#ef4444" />
        <View style={styles.resultTextContainer}>
          <Text style={[styles.resultTitle, styles.errorTitle]}>
            Upload Failed
          </Text>
          <Text style={styles.errorMessage}>{result.error}</Text>
        </View>
      </View>
    );
  };

  if (isPinataReady === false) {
    return (
      <View style={styles.container}>
        <View style={styles.errorBanner}>
          <AlertCircle size={24} color="#ef4444" />
          <Text style={styles.errorBannerText}>
            Pinata is not configured. Please set your API keys in the environment
            variables.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Upload Certificate</Text>
        {onCancel && (
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Connection Status */}
      {isPinataReady === null && (
        <View style={styles.loadingBanner}>
          <ActivityIndicator size="small" color="#6366f1" />
          <Text style={styles.loadingText}>Checking Pinata connection...</Text>
        </View>
      )}

      {/* Image Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certificate Image *</Text>
        
        {selectedImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handlePickImage}
            >
              <ImageIcon size={32} color="#6366f1" />
              <Text style={styles.imageButtonText}>Choose from Library</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleTakePhoto}
            >
              <Camera size={32} color="#6366f1" />
              <Text style={styles.imageButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Form Fields */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certificate Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Certificate Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., React Native Development Certificate"
            value={formData.name || ''}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Brief description of the certificate..."
            value={formData.description || ''}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={3}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Issuer Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Academy, University Name"
            value={formData.issuerName || ''}
            onChangeText={(text) => setFormData({ ...formData, issuerName: text })}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recipient Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Full name of the certificate recipient"
            value={formData.recipientName || ''}
            onChangeText={(text) =>
              setFormData({ ...formData, recipientName: text })
            }
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Development, Design, Marketing"
            value={formData.category || ''}
            onChangeText={(text) => setFormData({ ...formData, category: text })}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Skills (comma-separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., React, TypeScript, Mobile Development"
            value={skills}
            onChangeText={setSkills}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Issue Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.issueDate || ''}
            onChangeText={(text) => setFormData({ ...formData, issueDate: text })}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Recipient Address (Read-only) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Blockchain Details</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recipient Wallet Address</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText} numberOfLines={1}>
              {recipientAddress}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress */}
      {isUploading && renderProgressBar()}

      {/* Result */}
      {renderResult()}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (isUploading || isPinataReady === null) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isUploading || isPinataReady === null}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Upload size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Upload to IPFS</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Reset Button (if result exists) */}
      {result && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            reset();
            setSelectedImage(null);
            setFormData({
              recipientAddress,
              issueDate: new Date().toISOString().split('T')[0],
            });
            setSkills('');
          }}
        >
          <Text style={styles.resetButtonText}>Upload Another Certificate</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    padding: 8,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7f1d1d',
    padding: 16,
    borderRadius: 8,
    margin: 20,
    gap: 12,
  },
  errorBannerText: {
    color: '#fca5a5',
    fontSize: 14,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2d2d3d',
    borderStyle: 'dashed',
    gap: 8,
  },
  imageButtonText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e1e2e',
    borderRadius: 8,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  readOnlyInput: {
    backgroundColor: '#1e1e2e',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  readOnlyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#2d2d3d',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  progressText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  resultContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  errorContainer: {
    borderColor: '#ef4444',
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 8,
  },
  errorTitle: {
    color: '#ef4444',
  },
  resultLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  resultUri: {
    fontSize: 12,
    color: '#6366f1',
    fontFamily: 'monospace',
  },
  viewButton: {
    marginTop: 12,
    backgroundColor: '#2d2d3d',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '500',
  },
  errorMessage: {
    color: '#fca5a5',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#4b5563',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  resetButtonText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});
