import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView
} from 'react-native';
import { LogOut, Award, Lock, HelpCircle, Share2 } from 'lucide-react-native';
import { useAuth } from '@/context/authContext';
import ProfileHeader from '@/components/ui/ProfileHeader';
import WalletCard from '@/components/ui/WalletCard';
import StatCard from '@/components/ui/StatCard';
import ActionButton from '@/components/ui/ActionButton';
import SettingItem from '@/components/ui/SettingItem';

export default function Profile() {
  const [modalVisible, setModalVisible] = useState<null | 'signout' | 'edit' | 'settings'>(null);
  const [copied, setCopied] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { signOut } = useAuth();

  const handleSignOut = () => {
    setModalVisible(null);
    console.log('User signed out');
    signOut();
  };

  const handleEditProfile = () => {
    setModalVisible(null);
    console.log('Edit Profile clicked');
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileHeader 
          name="John Doe"
          email="john@example.com"
        />

        <WalletCard 
          address="0x742d35Cc6634C0532925a3b844Bc9e7595f8f6e"
          onCopy={() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          copied={copied}
        />

        {/* Blockchain Stats */}
        <View style={styles.statsSection}>
          <StatCard 
            icon={Award}
            value="12"
            label="Certificates"
          />
          <View style={styles.statCard}>
            <Text style={styles.statBadge}>✓</Text>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
          <StatCard 
            icon={Lock}
            value="12"
            label="On-Chain"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ActionButton 
            icon={Award}
            title="View All Certificates"
            subtitle="Browse your blockchain credentials"
          />
          <ActionButton 
            icon={Share2}
            title="Share Profile"
            subtitle="Let others verify your credentials"
          />
        </View>

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
          <Text style={styles.footerText}>Certik • Jan 2024</Text>
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

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginVertical: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6366f1',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },
  statBadge: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '700',
    marginBottom: 8,
  },

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
