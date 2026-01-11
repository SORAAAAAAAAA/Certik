import React, { createContext, useContext, ReactNode } from 'react';
import { useAppKit, useAccount, useAppKitState } from '@reown/appkit-react-native';

interface WalletContextType {
    isWalletConnected: boolean;
    walletAddress: string | null;
    chainId: string | number | undefined;
    connectWallet: () => void;
    disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    // Use AppKit hooks for real wallet connection
    const { open, disconnect } = useAppKit();
    const { address, isConnected, chainId } = useAccount();
    const appKitState = useAppKitState();

    // Debug log to track wallet state
    console.log('[WalletContext] useAccount:', { isConnected, address: address?.slice(0, 10) + '...', chainId });
    console.log('[WalletContext] useAppKitState:', appKitState);

    const connectWallet = () => {
        // Opens the AppKit modal for wallet connection
        open();
    };

    const disconnectWallet = () => {
        // Disconnect from AppKit
        disconnect();
    };

    return (
        <WalletContext.Provider
            value={{
                isWalletConnected: isConnected,
                walletAddress: address || null,
                chainId,
                connectWallet,
                disconnectWallet
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}
