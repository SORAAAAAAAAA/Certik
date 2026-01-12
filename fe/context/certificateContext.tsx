import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useWallet } from './walletContext';
import { getCertificatesWithMetadata, OnChainCertificate } from '@/utils/blockchain/certificate.service';

interface CertificateStats {
  total: number;
  verified: number;
  onChain: number;
  verifiedPercent: string;
}

interface CertificateContextType {
  certificates: OnChainCertificate[];
  stats: CertificateStats;
  isLoading: boolean;
  error: string | null;
  refreshCertificates: () => Promise<void>;
}

const defaultStats: CertificateStats = {
  total: 0,
  verified: 0,
  onChain: 0,
  verifiedPercent: '0%',
};

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

export function CertificateProvider({ children }: { children: ReactNode }) {
  const { walletAddress, isWalletConnected } = useWallet();
  const [certificates, setCertificates] = useState<OnChainCertificate[]>([]);
  const [stats, setStats] = useState<CertificateStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCertificates = useCallback(async () => {
    if (!walletAddress) {
      setCertificates([]);
      setStats(defaultStats);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[CertificateContext] Fetching certificates for:', walletAddress);
      const certs = await getCertificatesWithMetadata(walletAddress);
      console.log('[CertificateContext] Fetched certificates:', certs.length);
      
      setCertificates(certs);
      
      // Calculate stats
      // All certificates on the blockchain are verified and on-chain
      const total = certs.length;
      const verified = certs.filter(c => !c.revoked).length;
      const onChain = total; // All fetched certificates are on-chain
      const verifiedPercent = total > 0 ? Math.round((verified / total) * 100) + '%' : '0%';
      
      setStats({
        total,
        verified,
        onChain,
        verifiedPercent,
      });
    } catch (err) {
      console.error('[CertificateContext] Error fetching certificates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch certificates');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Auto-fetch when wallet connects
  useEffect(() => {
    if (isWalletConnected && walletAddress) {
      refreshCertificates();
    } else {
      setCertificates([]);
      setStats(defaultStats);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalletConnected, walletAddress]);

  return (
    <CertificateContext.Provider
      value={{
        certificates,
        stats,
        isLoading,
        error,
        refreshCertificates,
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
}

export function useCertificates() {
  const context = useContext(CertificateContext);
  if (context === undefined) {
    throw new Error('useCertificates must be used within a CertificateProvider');
  }
  return context;
}
