/**
 * Certificate Mint Hook
 * Combines IPFS upload and blockchain minting into a single hook
 */

import { useState, useCallback } from 'react';
import { Eip1193Provider } from 'ethers';
import { CertificateInput, ImageSource } from '@/types/certificate';
import {
  uploadAndMintCertificate,
  getCertificateInfo,
  isCertificateValid,
  getTotalCertificates,
  createProvider,
  MintProgress,
  MintResult,
} from '@/utils/blockchain/certificate.service';

interface UseCertificateMintReturn {
  // State
  isMinting: boolean;
  progress: MintProgress | null;
  result: MintResult | null;
  error: string | null;

  // Actions
  mintCertificate: (
    imageSource: ImageSource,
    certificateData: CertificateInput,
    walletProvider: Eip1193Provider
  ) => Promise<MintResult>;
  
  // Query functions
  fetchCertificateInfo: (tokenId: number, walletProvider: Eip1193Provider) => Promise<any>;
  checkCertificateValidity: (tokenId: number, walletProvider: Eip1193Provider) => Promise<boolean>;
  fetchTotalCertificates: (walletProvider: Eip1193Provider) => Promise<number>;
  
  // Utilities
  reset: () => void;
}

export const useCertificateMint = (): UseCertificateMintReturn => {
  const [isMinting, setIsMinting] = useState(false);
  const [progress, setProgress] = useState<MintProgress | null>(null);
  const [result, setResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mintCertificate = useCallback(
    async (
      imageSource: ImageSource,
      certificateData: CertificateInput,
      walletProvider: Eip1193Provider
    ): Promise<MintResult> => {
      setIsMinting(true);
      setError(null);
      setResult(null);
      setProgress({
        stage: 'idle',
        message: 'Starting mint process...',
      });

      try {
        const provider = createProvider(walletProvider);
        const mintResult = await uploadAndMintCertificate(
          imageSource,
          certificateData,
          provider,
          setProgress
        );

        setResult(mintResult);

        if (!mintResult.success) {
          setError(mintResult.error || 'Mint failed');
        }

        return mintResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        const failedResult: MintResult = {
          success: false,
          error: errorMessage,
        };
        setResult(failedResult);
        return failedResult;
      } finally {
        setIsMinting(false);
      }
    },
    []
  );

  const fetchCertificateInfo = useCallback(
    async (tokenId: number, walletProvider: Eip1193Provider) => {
      const provider = createProvider(walletProvider);
      return getCertificateInfo(tokenId, provider);
    },
    []
  );

  const checkCertificateValidity = useCallback(
    async (tokenId: number, walletProvider: Eip1193Provider) => {
      const provider = createProvider(walletProvider);
      return isCertificateValid(tokenId, provider);
    },
    []
  );

  const fetchTotalCertificates = useCallback(
    async (walletProvider: Eip1193Provider) => {
      const provider = createProvider(walletProvider);
      return getTotalCertificates(provider);
    },
    []
  );

  const reset = useCallback(() => {
    setIsMinting(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    isMinting,
    progress,
    result,
    error,
    mintCertificate,
    fetchCertificateInfo,
    checkCertificateValidity,
    fetchTotalCertificates,
    reset,
  };
};
