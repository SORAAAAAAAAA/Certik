import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Award, Lock } from 'lucide-react-native';
import StatCard from '@/components/ui/StatCard';

export default function BlockchainStats() {
    return (
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
    );
}

const styles = StyleSheet.create({
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
});
