import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse, safeJsonStringify } from '@walletconnect/safe-json';
import type { Storage as AppKitStorageType } from '@reown/appkit-react-native';

/**
 * AppKit storage implementation using AsyncStorage for React Native.
 * Uses WalletConnect's safe JSON utilities as recommended in the docs.
 */
export const Storage: AppKitStorageType = {
    async getKeys(): Promise<string[]> {
        const keys = await AsyncStorage.getAllKeys();
        return [...keys] as string[];
    },

    async getEntries<T = any>(): Promise<[string, T][]> {
        const keys = await AsyncStorage.getAllKeys();
        return await Promise.all(keys.map(async key => [
            key,
            safeJsonParse(await AsyncStorage.getItem(key) ?? '') as T,
        ]));
    },

    async getItem<T = any>(key: string): Promise<T | undefined> {
        const item = await AsyncStorage.getItem(key);
        if (typeof item === 'undefined' || item === null) {
            return undefined;
        }
        return safeJsonParse(item) as T;
    },

    async setItem<T = any>(key: string, value: T): Promise<void> {
        await AsyncStorage.setItem(key, safeJsonStringify(value));
    },

    async removeItem(key: string): Promise<void> {
        await AsyncStorage.removeItem(key);
    },
};