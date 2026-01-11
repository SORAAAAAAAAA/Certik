import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';
import { Copy, Settings } from 'lucide-react-native';
import { useAppKit } from '@reown/appkit-react-native';


interface WalletCardProps {
  address: string;
  onCopy?: () => void;
  copied?: boolean;
  onDisconnect?: () => void;
}

export default function WalletCard({
  address,
  onCopy,
  copied = false,
  onDisconnect
}: WalletCardProps) {
  const { open } = useAppKit();

  const handleCopy = () => {
    Clipboard.setString(address);
    onCopy?.();
  };

  const handleManageWallet = () => {
    // Open AppKit modal with Account view
    open({ view: 'Account' });
  };

  return (
    <View style={styles.walletCard}>
      <View style={styles.walletHeader}>
        <Text style={styles.walletLabel}>Wallet Address</Text>
        <TouchableOpacity onPress={handleManageWallet} style={styles.manageButton}>
          <Settings size={16} color="#6366f1" />
          <Text style={styles.manageText}>Manage</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.walletAddress}>{address}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopy}
        >
          <Copy size={16} color="#6366f1" />
          <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy Address'}</Text>
        </TouchableOpacity>

        {onDisconnect && (
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={onDisconnect}
          >
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  walletCard: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  manageText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  walletAddress: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disconnectText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
});
