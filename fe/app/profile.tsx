import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView 
} from 'react-native';
import FooterBar from '../components/ui/footerBar';
import { User, LogOut, Settings as SettingsIcon, Pen } from 'lucide-react-native';

export default function Profile() {
  // State for different modals
  const [modalVisible, setModalVisible] = useState<null | 'signout' | 'edit' | 'settings'>(null);

  const handleSignOut = () => {
    setModalVisible(null);
    console.log('User signed out');
    // Call signOut() here
  };

  const handleEditProfile = () => {
    setModalVisible(null);
    console.log('Edit Profile clicked');
    // Navigate to edit profile page or update state
  };

  const handleSettings = () => {
    setModalVisible(null);
    console.log('Settings clicked');
    // Navigate to settings page or open settings actions
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <User size={40} color="#6366f1" />
          </View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john@example.com</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => setModalVisible('edit')}
          >
            <Pen size={18} color="#4f46e5" />
            <Text style={styles.rowText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.row, styles.logoutRow]} 
            onPress={() => setModalVisible('signout')}
          >
            <LogOut size={18} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FooterBar />

      {/* Reusable Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible !== null}
        onRequestClose={() => setModalVisible(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {modalVisible === 'signout' && (
              <>
                <Text style={styles.modalTitle}>Confirm Sign Out</Text>
                <Text style={styles.modalMessage}>
                  Are you sure you want to sign out?
                </Text>
              </>
            )}
            {modalVisible === 'edit' && (
              <>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <Text style={styles.modalMessage}>
                  You can update your personal info and avatar here.
                </Text>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              {modalVisible === 'signout' && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]} 
                  onPress={handleSignOut}
                >
                  <Text style={styles.confirmText}>Sign Out</Text>
                </TouchableOpacity>
              )}
              {modalVisible === 'edit' && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]} 
                  onPress={handleEditProfile}
                >
                  <Text style={styles.confirmText}>Edit</Text>
                </TouchableOpacity>
              )}
              {modalVisible === 'settings' && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]} 
                  onPress={handleSettings}
                >
                  <Text style={styles.confirmText}>Open</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { flexGrow: 1, padding: 24 },

  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },

  section: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rowText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  logoutRow: {
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
 modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12,
    },
    modalButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100, // ensures buttons aren't too narrow
    },
    cancelButton: {
    backgroundColor: '#f3f4f6',
    flex: 1, // can shrink a little
    },
    confirmButton: {
    backgroundColor: '#4f46e5',
    flex: 1.2, // slightly bigger than cancel
    },
    cancelText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 15,
    },
    confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    },
});
