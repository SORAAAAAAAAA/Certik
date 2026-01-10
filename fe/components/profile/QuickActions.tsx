import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Award, Share2 } from 'lucide-react-native';
import ActionButton from '@/components/ui/ActionButton';

export default function QuickActions() {
    return (
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
    );
}

const styles = StyleSheet.create({
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
});
