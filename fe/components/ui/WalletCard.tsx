import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';
import { Copy } from 'lucide-react-native';

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
  const handleCopy = () => {
    Clipboard.setString(address);
    onCopy?.();
  };

  return (
    <View style={styles.walletCard}>
      <View style={styles.walletHeader}>
        <Text style={styles.walletLabel}>Wallet Address</Text>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Verified</Text>
        </View>
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
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    color: '#16a34a',
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
