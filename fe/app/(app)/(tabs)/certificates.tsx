import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { useState } from 'react';
import { Award, X } from 'lucide-react-native';
import { certificates } from '@/data/certificates';
import { CertificateType } from '@/types';
import { useWallet } from '@/context/walletContext';
import ConnectWalletCard from '@/components/profile/ConnectWalletCard';
import { useRouter } from 'expo-router';


export default function Certificates() {
  const router = useRouter();
  const { isWalletConnected } = useWallet();
  const [selectedCert, setSelectedCert] = useState<CertificateType | null>(null);

  const handleConnectWallet = () => {
    router.push({ pathname: '/(app)/(tabs)/profile', params: { scrollToTop: Date.now() } });
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Award size={28} color="#6366f1" />
          <Text style={styles.title}>Certificates</Text>
        </View>

        {!isWalletConnected ? (
          <ConnectWalletCard onConnect={handleConnectWallet} />
        ) : (
          <View style={styles.grid}>
            {certificates.map((cert) => (
              <TouchableOpacity
                key={cert.id}
                style={styles.card}
                onPress={() => setSelectedCert(cert)}
                activeOpacity={0.7}
              >
                <View style={styles.certImage}>
                  <Award size={48} color="#6366f1" />
                  <Text style={styles.certImageText}>Certificate</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.certTitle} numberOfLines={2}>
                    {cert.title}
                  </Text>
                  <Text style={styles.certIssuer}>{cert.issuer}</Text>
                  <Text style={styles.certDate}>Completed · {cert.date}</Text>
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
              <>
                <View style={styles.modalImage}>
                  <Award size={64} color="#6366f1" />
                  <Text style={styles.modalImageText}>Certificate Preview</Text>
                </View>

                <View style={styles.modalDetails}>
                  <Text style={styles.modalTitle}>{selectedCert.title}</Text>
                  <Text style={styles.modalIssuer}>Issued by {selectedCert.issuer}</Text>
                  <Text style={styles.modalDate}>Completed in {selectedCert.date}</Text>

                  <View style={styles.divider} />

                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.modalDescription}>{selectedCert.description}</Text>

                  <Text style={styles.sectionTitle}>Skills Covered</Text>
                  <View style={styles.skillsContainer}>
                    {selectedCert.skills.map((skill, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Full Certificate</Text>
                  </TouchableOpacity>
                </View>
              </>
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
  },
  certImageText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 8,
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
  modalImageText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 12,
  },

  modalDetails: {
    padding: 24,
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

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
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

  viewButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});