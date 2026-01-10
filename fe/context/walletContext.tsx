import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WalletContextType {
    isWalletConnected: boolean;
    walletAddress: string | null;
    connectWallet: () => void;
    disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    const connectWallet = () => {
        // Simulate connection
        setIsWalletConnected(true);
        setWalletAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f8f6e');
    };

    const disconnectWallet = () => {
        setIsWalletConnected(false);
        setWalletAddress(null);
    };

    return (
        <WalletContext.Provider
            value={{
                isWalletConnected,
                walletAddress,
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
