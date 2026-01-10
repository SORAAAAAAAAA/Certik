import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView
} from 'react-native';
import { LogOut, HelpCircle, Share2, Award, Lock } from 'lucide-react-native';
import { useAuth } from '@/context/authContext';
import { useWallet } from '@/context/walletContext';
import ProfileHeader from '@/components/ui/ProfileHeader';
import WalletCard from '@/components/ui/WalletCard';
import SettingItem from '@/components/ui/SettingItem';
import ConnectWalletCard from '@/components/profile/ConnectWalletCard';
import BlockchainStats from '@/components/profile/BlockchainStats';
import QuickActions from '@/components/profile/QuickActions';
import { useLocalSearchParams } from 'expo-router';

export default function Profile() {
  const [modalVisible, setModalVisible] = useState<null | 'signout' | 'edit' | 'settings'>(null);
  const [copied, setCopied] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('email@example.com');

  const { signOut, user } = useAuth();
  const { isWalletConnected, walletAddress, connectWallet, disconnectWallet } = useWallet();
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.scrollToTop) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [params.scrollToTop]);

  useEffect(() => {
    // Fetch user data on mount
    if (user && user.user.user_metadata.full_name) {
      setUserName(user.user.user_metadata.full_name);
    }
    if (user && user.user.user_metadata.email) {
      setUserEmail(user.user.user_metadata.email);
    }
  }, [user]);

  const handleSignOut = () => {
    setModalVisible(null);
    console.log('User signed out');
    signOut();
  };

  const handleEditProfile = () => {
    setModalVisible(null);
    console.log('Edit Profile clicked');
  };

  const handleToggleNotifications = async () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
      >
        <ProfileHeader
          name={userName}
          email={userEmail}
        />

        {isWalletConnected ? (
          <>
            <WalletCard
              address={walletAddress || ''}
              onCopy={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              copied={copied}
              onDisconnect={disconnectWallet}
            />

            <BlockchainStats />

            <QuickActions />
          </>
        ) : (
          <ConnectWalletCard onConnect={connectWallet} />
        )}

        {/* Account Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.settingsList}>
            <SettingItem
              icon={Award}
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => setModalVisible('edit')}
            />

            <SettingItem
              icon={Share2}
              title="Notifications"
              subtitle="Manage certificate alerts"
              toggle={true}
              toggleValue={notificationsEnabled}
              onToggle={handleToggleNotifications}
            />

            <SettingItem
              icon={Lock}
              title="Security"
              subtitle="Manage privacy & authentication"
            />

            <SettingItem
              icon={HelpCircle}
              title="Help & Support"
              subtitle="Get assistance & documentation"
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => setModalVisible('signout')}
          >
            <LogOut size={18} color="#ef4444" />
            <Text style={styles.dangerButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Certik • Jan 2026</Text>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </ScrollView>

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
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flexGrow: 1, paddingBottom: 40 },

  // Section Container
  sectionContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Settings List
  settingsList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },

  // Danger Button
  dangerButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  versionText: {
    fontSize: 11,
    color: '#d1d5db',
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
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#4f46e5',
    flex: 1.2,
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
