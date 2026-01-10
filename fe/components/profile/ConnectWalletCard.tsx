import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wallet } from 'lucide-react-native';

interface ConnectWalletCardProps {
    onConnect: () => void;
}

export default function ConnectWalletCard({ onConnect }: ConnectWalletCardProps) {
    return (
        <View style={styles.connectWalletCard}>
            <View style={styles.iconContainer}>
                <Wallet size={32} color="#6366f1" />
            </View>
            <View style={styles.connectTextContainer}>
                <Text style={styles.connectTitle}>Connect Wallet</Text>
                <Text style={styles.connectDescription}>
                    Link your wallet to view your on-chain certificates and reputation.
                </Text>
            </View>
            <TouchableOpacity
                style={styles.connectButton}
                onPress={onConnect}
            >
                <Text style={styles.connectButtonText}>Connect Wallet</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    connectWalletCard: {
        margin: 16,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#e0e7ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    connectTextContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    connectTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    connectDescription: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 16,
    },
    connectButton: {
        backgroundColor: '#4f46e5',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    connectButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
});
