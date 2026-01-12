import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, ActivityIndicator, RefreshControl, Linking, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { Award, X, RefreshCw, AlertCircle, CheckCircle, XCircle, ExternalLink, Ban } from 'lucide-react-native';
import { useWallet } from '@/context/walletContext';
import { useCertificates } from '@/context/certificateContext';
import ConnectWalletCard from '@/components/profile/ConnectWalletCard';
import { useRouter } from 'expo-router';
import { 
  OnChainCertificate,
  getImageUrlFromIPFS,
  revokeCertificateWithPrivateKey,
} from '@/utils/blockchain/certificate.service';


export default function Certificates() {
  const router = useRouter();
  const { isWalletConnected, walletAddress } = useWallet();
  const { certificates, isLoading, error, refreshCertificates } = useCertificates();
  
  const [selectedCert, setSelectedCert] = useState<OnChainCertificate | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshCertificates();
    setRefreshing(false);
  }, [refreshCertificates]);

  const handleConnectWallet = () => {
    router.push({ pathname: '/(app)/(tabs)/profile', params: { scrollToTop: Date.now() } });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSkillsFromMetadata = (cert: OnChainCertificate): string[] => {
    return cert.metadata?.properties?.certificate?.skills || [];
  };

  const getCertificateImageUrl = (cert: OnChainCertificate): string | null => {
    if (cert.metadata?.image) {
      return getImageUrlFromIPFS(cert.metadata.image);
    }
    return null;
  };

  const handleRevokeCertificate = (cert: OnChainCertificate) => {
    Alert.alert(
      'Revoke Certificate',
      `Are you sure you want to revoke "${cert.metadata?.name || `Certificate #${cert.tokenId}`}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            setIsRevoking(true);
            try {
              const result = await revokeCertificateWithPrivateKey(Number(cert.tokenId));
              if (result.success) {
                Alert.alert('Success', 'Certificate has been revoked successfully.');
                setSelectedCert(null);
                // Refresh certificates list
                refreshCertificates();
              } else {
                Alert.alert('Error', result.error || 'Failed to revoke certificate.');
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              Alert.alert('Error', errorMessage);
            } finally {
              setIsRevoking(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
      >
        <View style={styles.header}>
          <Award size={28} color="#6366f1" />
          <Text style={styles.title}>Certificates</Text>
          {isWalletConnected && (
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw size={20} color="#6366f1" />
            </TouchableOpacity>
          )}
        </View>

        {!isWalletConnected ? (
          <ConnectWalletCard onConnect={handleConnectWallet} />
        ) : isLoading && certificates.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Loading certificates from blockchain...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color="#ef4444" />
            <Text style={styles.errorTitle}>Error Loading Certificates</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshCertificates}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : certificates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Award size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Certificates Yet</Text>
            <Text style={styles.emptyText}>
              Your blockchain certificates will appear here after minting.
            </Text>
            <TouchableOpacity 
              style={styles.goHomeButton} 
              onPress={() => router.push('/(app)/(tabs)/home')}
            >
              <Text style={styles.goHomeButtonText}>Mint Your First Certificate</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {certificates.map((cert) => (
              <TouchableOpacity
                key={cert.tokenId}
                style={styles.card}
                onPress={() => setSelectedCert(cert)}
                activeOpacity={0.7}
              >
                <View style={styles.certImage}>
                  {getCertificateImageUrl(cert) ? (
                    <Image 
                      source={{ uri: getCertificateImageUrl(cert)! }}
                      style={styles.certImageActual}
                      resizeMode="cover"
                    />
                  ) : (
                    <>
                      <Award size={48} color="#6366f1" />
                      <Text style={styles.certImageText}>Certificate</Text>
                    </>
                  )}
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.certTitle} numberOfLines={2}>
                    {cert.metadata?.name || `Certificate #${cert.tokenId}`}
                  </Text>
                  <Text style={styles.certIssuer}>
                    {cert.metadata?.properties?.issuer?.name || 'Unknown Issuer'}
                  </Text>
                  <Text style={styles.certDate}>
                    Issued · {formatDate(cert.issuedAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={selectedCert !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCert(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedCert(null)}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>

            {selectedCert && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalImage}>
                  {getCertificateImageUrl(selectedCert) ? (
                    <Image 
                      source={{ uri: getCertificateImageUrl(selectedCert)! }}
                      style={styles.modalImageActual}
                      resizeMode="contain"
                    />
                  ) : (
                    <>
                      <Award size={64} color="#6366f1" />
                      <Text style={styles.modalImageText}>Certificate Preview</Text>
                    </>
                  )}
                </View>

                <View style={styles.modalDetails}>
                  {/* Status Banner */}
                  <View style={[
                    styles.statusBanner, 
                    selectedCert.revoked ? styles.revokedBanner : styles.validBanner
                  ]}>
                    {selectedCert.revoked ? (
                      <XCircle size={20} color="#ef4444" />
                    ) : (
                      <CheckCircle size={20} color="#10b981" />
                    )}
                    <Text style={[
                      styles.statusBannerText,
                      selectedCert.revoked ? styles.revokedBannerText : styles.validBannerText
                    ]}>
                      {selectedCert.revoked ? 'This certificate has been revoked' : 'Valid Certificate'}
                    </Text>
                  </View>

                  <Text style={styles.modalTitle}>
                    {selectedCert.metadata?.name || `Certificate #${selectedCert.tokenId}`}
                  </Text>
                  <Text style={styles.modalIssuer}>
                    Issued by {selectedCert.metadata?.properties?.issuer?.name || 'Unknown'}
                  </Text>
                  <Text style={styles.modalDate}>
                    Issued on {formatDate(selectedCert.issuedAt)}
                  </Text>

                  <View style={styles.divider} />

                  {/* Token Info */}
                  <Text style={styles.sectionTitle}>Blockchain Info</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Token ID:</Text>
                    <Text style={styles.infoValue}>#{selectedCert.tokenId}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Owner:</Text>
                    <Text style={styles.infoValueSmall} numberOfLines={1}>
                      {selectedCert.owner.slice(0, 10)}...{selectedCert.owner.slice(-8)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Issuer:</Text>
                    <Text style={styles.infoValueSmall} numberOfLines={1}>
                      {selectedCert.issuer.slice(0, 10)}...{selectedCert.issuer.slice(-8)}
                    </Text>
                  </View>

                  {selectedCert.metadata?.description && (
                    <>
                      <View style={styles.divider} />
                      <Text style={styles.sectionTitle}>Description</Text>
                      <Text style={styles.modalDescription}>
                        {selectedCert.metadata.description}
                      </Text>
                    </>
                  )}

                  {getSkillsFromMetadata(selectedCert).length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Skills Covered</Text>
                      <View style={styles.skillsContainer}>
                        {getSkillsFromMetadata(selectedCert).map((skill, index) => (
                          <View key={index} style={styles.skillTag}>
                            <Text style={styles.skillText}>{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}

                  {/* Attributes */}
                  {selectedCert.metadata?.attributes && selectedCert.metadata.attributes.length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Attributes</Text>
                      <View style={styles.attributesGrid}>
                        {selectedCert.metadata.attributes.map((attr, index) => (
                          <View key={index} style={styles.attributeCard}>
                            <Text style={styles.attributeType}>{attr.trait_type}</Text>
                            <Text style={styles.attributeValue}>{attr.value}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}

                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => {
                      const contractAddress = process.env.EXPO_PUBLIC_CONTRACT_ADDRESS;
                      const explorerUrl = `https://sepolia.basescan.org/nft/${contractAddress}/${selectedCert.tokenId}`;
                      Linking.openURL(explorerUrl);
                    }}
                    activeOpacity={0.85}
                  >
                    <ExternalLink size={16} color="#ffffff" />
                    <Text style={styles.viewButtonText}>View on Explorer</Text>
                  </TouchableOpacity>

                  {/* Revoke Button - Only show if not already revoked */}
                  {!selectedCert.revoked && (
                    <TouchableOpacity 
                      style={[styles.revokeButton, isRevoking && styles.revokeButtonDisabled]}
                      onPress={() => handleRevokeCertificate(selectedCert)}
                      activeOpacity={0.85}
                      disabled={isRevoking}
                    >
                      {isRevoking ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                      ) : (
                        <Ban size={16} color="#ef4444" />
                      )}
                      <Text style={styles.revokeButtonText}>
                        {isRevoking ? 'Revoking...' : 'Revoke Certificate'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 24, paddingBottom: 80 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  goHomeButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goHomeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  certImage: {
    backgroundColor: '#f0f4ff',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    position: 'relative',
  },
  certImageActual: {
    width: '100%',
    height: '100%',
  },
  certImageText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 8,
  },

  // Token ID Badge
  tokenIdBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tokenIdText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Status Badge
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  validBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  revokedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  validText: {
    color: '#10b981',
  },
  revokedText: {
    color: '#ef4444',
  },

  cardContent: {
    padding: 16,
  },
  certTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  certIssuer: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  certDate: {
    fontSize: 12,
    color: '#9ca3af',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 8,
  },

  modalImage: {
    backgroundColor: '#f0f4ff',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageActual: {
    width: '100%',
    height: '100%',
  },
  modalImageText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 12,
  },

  modalDetails: {
    padding: 24,
  },

  // Status Banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  validBanner: {
    backgroundColor: '#ecfdf5',
  },
  revokedBanner: {
    backgroundColor: '#fef2f2',
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  validBannerText: {
    color: '#10b981',
  },
  revokedBannerText: {
    color: '#ef4444',
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalIssuer: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: '#9ca3af',
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  infoValueSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'monospace',
    maxWidth: '60%',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 20,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  skillTag: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  skillText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
  },

  // Attributes Grid
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  attributeCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  attributeType: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  attributeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  viewButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  revokeButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  revokeButtonDisabled: {
    opacity: 0.6,
  },
  revokeButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});