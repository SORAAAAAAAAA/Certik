import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface SettingItemProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingItem({
  icon: Icon,
  title,
  subtitle,
  toggle = false,
  toggleValue = false,
  onPress,
  onToggle,
}: SettingItemProps) {
  const handlePress = () => {
    if (toggle && onToggle) {
      onToggle(!toggleValue);
    } else {
      onPress?.();
    }
  };

  const content = (
    <>
      <View style={styles.settingIconBox}>
        <Icon size={18} color="#6366f1" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {toggle && (
        <View style={[styles.toggleSwitch, toggleValue && styles.toggleSwitchActive]}>
          <View style={[styles.toggleActive, toggleValue && styles.toggleActivePosition]} />
        </View>
      )}
    </>
  );

  return (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={handlePress}
      activeOpacity={toggle ? 0.7 : 0.6}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d1d5db',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#6366f1',
  },
  toggleActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  toggleActivePosition: {
    marginLeft: 'auto',
  },
});
