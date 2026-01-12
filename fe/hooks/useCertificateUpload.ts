/**
 * Certificate Upload Hook
 * Provides a simple interface for uploading certificates to IPFS via Pinata
 */

import { useState, useCallback } from 'react';
import {
  CertificateInput,
  CertificateUploadResult,
  UploadProgress,
  ImageSource,
} from '@/types/certificate';
import {
  uploadCertificateToIPFS,
  testPinataAuth,
  getIPFSUrl,
} from '@/utils/pinata/pinata.service';

interface UseCertificateUploadReturn {
  // State
  isUploading: boolean;
  progress: UploadProgress | null;
  result: CertificateUploadResult | null;
  error: string | null;

  // Actions
  uploadCertificate: (
    imageSource: ImageSource,
    certificateData: CertificateInput
  ) => Promise<CertificateUploadResult>;
  validatePinataConnection: () => Promise<boolean>;
  reset: () => void;

  // Helpers
  getGatewayUrl: (ipfsHash: string) => string;
}

export const useCertificateUpload = (): UseCertificateUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [result, setResult] = useState<CertificateUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadCertificate = useCallback(
    async (
      imageSource: ImageSource,
      certificateData: CertificateInput
    ): Promise<CertificateUploadResult> => {
      setIsUploading(true);
      setError(null);
      setResult(null);
      setProgress({
        stage: 'preparing',
        progress: 0,
        message: 'Starting upload...',
      });

      try {
        const uploadResult = await uploadCertificateToIPFS(
          imageSource,
          certificateData,
          setProgress
        );

        setResult(uploadResult);

        if (!uploadResult.success) {
          setError(uploadResult.error || 'Upload failed');
        }

        return uploadResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        const failedResult: CertificateUploadResult = {
          success: false,
          error: errorMessage,
        };
        setResult(failedResult);
        return failedResult;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const validatePinataConnection = useCallback(async (): Promise<boolean> => {
    try {
      return await testPinataAuth();
    } catch {
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    isUploading,
    progress,
    result,
    error,
    uploadCertificate,
    validatePinataConnection,
    reset,
    getGatewayUrl: getIPFSUrl,
  };
};
