/**
 * Certificate Mint Service
 * Integrates Pinata upload with smart contract minting
 */

import { Contract, BrowserProvider, JsonRpcSigner, Eip1193Provider, JsonRpcProvider, Wallet, Interface } from 'ethers';
import { CertificateInput, ImageSource, UploadProgress } from '@/types/certificate';
import { uploadCertificateToIPFS } from '@/utils/pinata/pinata.service';

// Import the ABI from your smart contract
// ABI file is located inside the fe project for Metro bundler compatibility
const CertificateNFTAbi = require('@/abi/CertificateNFT.json');

// Contract address from deployment (Base Sepolia)
// Set this in your .env file as EXPO_PUBLIC_CONTRACT_ADDRESS
const CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_CONTRACT_ADDRESS || '';

// Public RPC URLs for Base Sepolia (for read-only operations)
const PUBLIC_RPC_URLS = [
  'https://base-sepolia-rpc.publicnode.com',
  'https://sepolia.base.org',
  'https://base-sepolia.blockpi.network/v1/rpc/public',
];

export interface MintProgress {
  stage: 'idle' | 'uploading' | 'minting' | 'confirming' | 'complete' | 'error';
  uploadProgress?: UploadProgress;
  txHash?: string;
  tokenId?: number;
  message: string;
}

export interface MintResult {
  success: boolean;
  tokenId?: number;
  txHash?: string;
  metadataUri?: string;
  error?: string;
}

/**
 * Create owner wallet from private key for minting
 */
const createOwnerWallet = (): Wallet | null => {
  const privateKey = process.env.EXPO_PUBLIC_OWNER_PRIVATE_KEY;
  if (!privateKey) {
    return null;
  }
  const provider = createReadOnlyProvider();
  return new Wallet(privateKey, provider);
};

/**
 * Create a BrowserProvider from AppKit's wallet provider
 * @param walletProvider - EIP-1193 provider from AppKit
 */
export const createProvider = (walletProvider: Eip1193Provider): BrowserProvider => {
  return new BrowserProvider(walletProvider);
};

/**
 * Create a read-only JSON RPC provider for public queries
 * This doesn't require wallet connection
 */
export const createReadOnlyProvider = (): JsonRpcProvider => {
  const rpcUrl = process.env.EXPO_PUBLIC_BASE_SEPOLIA_RPC || PUBLIC_RPC_URLS[0];
  return new JsonRpcProvider(rpcUrl);
};

/**
 * Get the CertificateNFT contract instance with signer (for write operations)
 * @param signer - Ethers signer from the connected wallet or Wallet
 */
export const getCertificateContract = (signer: JsonRpcSigner | Wallet): Contract => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured. Set EXPO_PUBLIC_CONTRACT_ADDRESS in your .env file');
  }
  const abi = CertificateNFTAbi.abi || CertificateNFTAbi;
  return new Contract(CONTRACT_ADDRESS, abi, signer);
};

/**
 * Get the CertificateNFT contract instance for read-only operations
 * @param provider - Ethers JsonRpcProvider for read-only access
 */
export const getReadOnlyContract = (provider: JsonRpcProvider): Contract => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured. Set EXPO_PUBLIC_CONTRACT_ADDRESS in your .env file');
  }
  const abi = CertificateNFTAbi.abi || CertificateNFTAbi;
  return new Contract(CONTRACT_ADDRESS, abi, provider);
};

/**
 * Upload certificate to IPFS and mint as NFT
 * This is the main function that combines Pinata upload with smart contract minting
 * 
 * @param imageSource - Certificate image
 * @param certificateInput - Certificate data
 * @param provider - Ethers BrowserProvider from wallet connection
 * @param onProgress - Progress callback
 * @returns MintResult with token ID and transaction hash
 */
export const uploadAndMintCertificate = async (
  imageSource: ImageSource,
  certificateInput: CertificateInput,
  provider: BrowserProvider,
  onProgress?: (progress: MintProgress) => void
): Promise<MintResult> => {
  try {
    // Stage 1: Upload to IPFS
    onProgress?.({
      stage: 'uploading',
      message: 'Uploading certificate to IPFS...',
    });

    const uploadResult = await uploadCertificateToIPFS(
      imageSource,
      certificateInput,
      (uploadProgress) => {
        onProgress?.({
          stage: 'uploading',
          uploadProgress,
          message: uploadProgress.message,
        });
      }
    );

    if (!uploadResult.success || !uploadResult.metadataUri) {
      throw new Error(uploadResult.error || 'Failed to upload to IPFS');
    }

    // Stage 2: Get signer and contract
    onProgress?.({
      stage: 'minting',
      message: 'Preparing transaction...',
    });

    const signer = await provider.getSigner();
    const contract = getCertificateContract(signer);

    // Stage 3: Call mint function
    onProgress?.({
      stage: 'minting',
      message: 'Please confirm the transaction in your wallet...',
    });

    const tx = await contract.mintCertificate(
      certificateInput.recipientAddress,
      uploadResult.metadataUri
    );

    onProgress?.({
      stage: 'confirming',
      txHash: tx.hash,
      message: 'Transaction submitted. Waiting for confirmation...',
    });

    // Stage 4: Wait for confirmation
    const receipt = await tx.wait();

    // Extract token ID from events
    let tokenId: number | undefined;
    
    // Look for CertificateMinted event
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsedLog?.name === 'CertificateMinted') {
          tokenId = Number(parsedLog.args[0]); // First arg is tokenId
          break;
        }
      } catch {
        // Skip logs that can't be parsed
        continue;
      }
    }

    onProgress?.({
      stage: 'complete',
      txHash: tx.hash,
      tokenId,
      message: 'Certificate minted successfully!',
    });

    return {
      success: true,
      tokenId,
      txHash: tx.hash,
      metadataUri: uploadResult.metadataUri,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    onProgress?.({
      stage: 'error',
      message: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Get certificate information from the contract
 * @param tokenId - Token ID of the certificate
 * @param provider - Ethers provider
 */
export const getCertificateInfo = async (
  tokenId: number,
  provider: BrowserProvider
): Promise<{
  owner: string;
  issuer: string;
  metadataURI: string;
  issuedAt: number;
  isValid: boolean;
  revoked: boolean;
} | null> => {
  try {
    const signer = await provider.getSigner();
    const contract = getCertificateContract(signer);
    
    const info = await contract.getCertificateInfo(tokenId);
    
    return {
      owner: info[0],
      issuer: info[1],
      metadataURI: info[2],
      issuedAt: Number(info[3]),
      isValid: info[4],
      revoked: info[5],
    };
  } catch (error) {
    console.error('Error fetching certificate info:', error);
    return null;
  }
};

/**
 * Check if a certificate is valid
 * @param tokenId - Token ID to check
 * @param provider - Ethers provider
 */
export const isCertificateValid = async (
  tokenId: number,
  provider: BrowserProvider
): Promise<boolean> => {
  try {
    const signer = await provider.getSigner();
    const contract = getCertificateContract(signer);
    return await contract.isCertificateValid(tokenId);
  } catch (error) {
    console.error('Error checking certificate validity:', error);
    return false;
  }
};

/**
 * Get total number of certificates minted
 * @param provider - Ethers provider
 */
export const getTotalCertificates = async (
  provider: BrowserProvider
): Promise<number> => {
  try {
    const signer = await provider.getSigner();
    const contract = getCertificateContract(signer);
    const total = await contract.getTotalCertificates();
    return Number(total);
  } catch (error) {
    console.error('Error fetching total certificates:', error);
    return 0;
  }
};

/**
 * Mint a certificate NFT directly (without uploading to IPFS)
 * Use this when you already have the metadata URI from Pinata
 * 
 * @param recipientAddress - Address to receive the certificate
 * @param metadataUri - IPFS URI of the certificate metadata
 * @param provider - Ethers BrowserProvider from wallet connection
 * @param onProgress - Progress callback
 * @returns MintResult with token ID and transaction hash
 */
export const mintCertificateOnly = async (
  recipientAddress: string,
  metadataUri: string,
  provider: BrowserProvider,
  onProgress?: (progress: MintProgress) => void
): Promise<MintResult> => {
  try {
    // Get signer and contract
    onProgress?.({
      stage: 'minting',
      message: 'Preparing transaction...',
    });

    const signer = await provider.getSigner();
    const contract = getCertificateContract(signer);

    // Call mint function
    onProgress?.({
      stage: 'minting',
      message: 'Please confirm the transaction in your wallet...',
    });

    const tx = await contract.mintCertificate(recipientAddress, metadataUri);

    onProgress?.({
      stage: 'confirming',
      txHash: tx.hash,
      message: 'Transaction submitted. Waiting for confirmation...',
    });

    // Wait for confirmation
    const receipt = await tx.wait();

    // Extract token ID from events
    let tokenId: number | undefined;
    
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsedLog?.name === 'CertificateMinted') {
          tokenId = Number(parsedLog.args[0]);
          break;
        }
      } catch {
        continue;
      }
    }

    onProgress?.({
      stage: 'complete',
      txHash: tx.hash,
      tokenId,
      message: 'Certificate minted successfully!',
    });

    return {
      success: true,
      tokenId,
      txHash: tx.hash,
      metadataUri,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    onProgress?.({
      stage: 'error',
      message: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Fetch all certificates owned by a specific address
 * Uses read-only provider - no wallet connection required
 * @param ownerAddress - The address to check for certificates
 * @returns Array of certificate data with metadata
 */
export const getCertificatesByOwner = async (
  ownerAddress: string
): Promise<OnChainCertificate[]> => {
  try {
    const provider = createReadOnlyProvider();
    const contract = getReadOnlyContract(provider);
    
    const totalCerts = await contract.getTotalCertificates();
    const total = Number(totalCerts);
    
    console.log('[getCertificatesByOwner] Total certificates:', total);
    
    const certificates: OnChainCertificate[] = [];
    
    // Iterate through all token IDs and check ownership
    for (let tokenId = 1; tokenId <= total; tokenId++) {
      try {
        const owner = await contract.ownerOf(tokenId);
        
        if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
          const info = await contract.getCertificateInfo(tokenId);
          
          certificates.push({
            tokenId,
            owner: info[0],
            issuer: info[1],
            metadataURI: info[2],
            issuedAt: Number(info[3]),
            isValid: info[4],
            revoked: info[5],
          });
        }
      } catch {
        // Token might not exist or other error, continue
        continue;
      }
    }
    
    return certificates;
  } catch (error) {
    console.error('Error fetching certificates by owner:', error);
    return [];
  }
};

/**
 * On-chain certificate data structure
 */
export interface OnChainCertificate {
  tokenId: number;
  owner: string;
  issuer: string;
  metadataURI: string;
  issuedAt: number;
  isValid: boolean;
  revoked: boolean;
  // Metadata fetched from IPFS (optional)
  metadata?: CertificateMetadata;
}

/**
 * Certificate metadata from IPFS
 */
export interface CertificateMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: {
    issuer?: {
      name: string;
      address?: string;
    };
    recipient?: {
      name: string;
      address: string;
    };
    certificate?: {
      issueDate: string;
      expirationDate?: string;
      credentialId?: string;
      category?: string;
      skills?: string[];
    };
  };
}

/**
 * Fetch metadata from IPFS URI
 * @param ipfsUri - IPFS URI (ipfs://...)
 * @returns Parsed metadata object
 */
export const fetchMetadataFromIPFS = async (
  ipfsUri: string
): Promise<CertificateMetadata | null> => {
  try {
    // Convert ipfs:// to gateway URL
    let httpUrl: string;
    
    if (ipfsUri.startsWith('ipfs://')) {
      const hash = ipfsUri.replace('ipfs://', '');
      // Use Pinata gateway from env or fallback
      const gateway = process.env.EXPO_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
      httpUrl = `${gateway}/${hash}`;
    } else {
      httpUrl = ipfsUri;
    }
    
    const response = await fetch(httpUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    return null;
  }
};

/**
 * Get certificate image URL from IPFS URI
 * @param ipfsUri - IPFS URI (ipfs://...)
 * @returns HTTP URL for the image
 */
export const getImageUrlFromIPFS = (ipfsUri: string): string => {
  if (!ipfsUri) return '';
  
  if (ipfsUri.startsWith('ipfs://')) {
    const hash = ipfsUri.replace('ipfs://', '');
    const gateway = process.env.EXPO_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
    return `${gateway}/${hash}`;
  }
  
  return ipfsUri;
};

/**
 * Fetch certificates with full metadata for an owner
 * Uses read-only provider - no wallet connection required
 * @param ownerAddress - The address to check for certificates
 * @returns Array of certificates with metadata
 */
export const getCertificatesWithMetadata = async (
  ownerAddress: string
): Promise<OnChainCertificate[]> => {
  const certificates = await getCertificatesByOwner(ownerAddress);
  
  console.log('[getCertificatesWithMetadata] Certificates found:', certificates.length);
  
  // Fetch metadata for each certificate
  const certificatesWithMetadata = await Promise.all(
    certificates.map(async (cert) => {
      const metadata = await fetchMetadataFromIPFS(cert.metadataURI);
      return {
        ...cert,
        metadata: metadata || undefined,
      };
    })
  );
  
  return certificatesWithMetadata;
};

/**
 * Mint a certificate using the contract owner's private key
 * This bypasses WalletConnect - uses direct blockchain transaction
 * 
 * @param recipientAddress - Address to receive the certificate
 * @param metadataUri - IPFS URI of the certificate metadata
 * @param onProgress - Progress callback
 * @returns MintResult with token ID and transaction hash
 */
export const mintWithPrivateKey = async (
  recipientAddress: string,
  metadataUri: string,
  onProgress?: (progress: MintProgress) => void
): Promise<MintResult> => {
  try {
    console.log('[MintPrivateKey] Starting mint with private key');
    console.log('[MintPrivateKey] Recipient:', recipientAddress);
    console.log('[MintPrivateKey] Metadata URI:', metadataUri);
    
    onProgress?.({
      stage: 'minting',
      message: 'Preparing transaction...',
    });

    const wallet = createOwnerWallet();
    if (!wallet) {
      throw new Error('Owner private key not configured. Set EXPO_PUBLIC_OWNER_PRIVATE_KEY in .env');
    }
    
    console.log('[MintPrivateKey] Wallet address:', wallet.address);
    
    const contract = getCertificateContract(wallet);
    
    onProgress?.({
      stage: 'minting',
      message: 'Sending transaction...',
    });
    
    console.log('[MintPrivateKey] Calling mintCertificate...');
    const tx = await contract.mintCertificate(recipientAddress, metadataUri, {
      gasLimit: 300000n,
    });
    
    console.log('[MintPrivateKey] Transaction sent:', tx.hash);
    
    onProgress?.({
      stage: 'confirming',
      txHash: tx.hash,
      message: 'Transaction submitted. Waiting for confirmation...',
    });
    
    const receipt = await tx.wait();
    console.log('[MintPrivateKey] Transaction confirmed in block:', receipt.blockNumber);
    
    // Extract token ID from events
    let tokenId: number | undefined;
    const abi = CertificateNFTAbi.abi || CertificateNFTAbi;
    const iface = new Interface(abi);
    
    for (const log of receipt.logs) {
      try {
        const parsedLog = iface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsedLog?.name === 'CertificateMinted') {
          tokenId = Number(parsedLog.args[0]);
          console.log('[MintPrivateKey] Extracted tokenId:', tokenId);
          break;
        }
      } catch {
        continue;
      }
    }
    
    onProgress?.({
      stage: 'complete',
      txHash: tx.hash,
      tokenId,
      message: 'Certificate minted successfully!',
    });
    
    return {
      success: true,
      tokenId,
      txHash: tx.hash,
      metadataUri,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MintPrivateKey] Error:', errorMessage);
    
    onProgress?.({
      stage: 'error',
      message: errorMessage,
    });
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Revoke a certificate using the contract owner's private key
 * Only the contract owner can revoke certificates
 * 
 * @param tokenId - Token ID of the certificate to revoke
 * @returns Result with success status and transaction hash
 */
export const revokeCertificateWithPrivateKey = async (
  tokenId: number
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    console.log('[RevokeCertificate] Starting revoke for token:', tokenId);
    
    const wallet = createOwnerWallet();
    if (!wallet) {
      throw new Error('Owner private key not configured. Set EXPO_PUBLIC_OWNER_PRIVATE_KEY in .env');
    }
    
    console.log('[RevokeCertificate] Wallet address:', wallet.address);
    
    const contract = getCertificateContract(wallet);
    
    console.log('[RevokeCertificate] Calling revokeCertificate...');
    const tx = await contract.revokeCertificate(tokenId, {
      gasLimit: 100000n,
    });
    
    console.log('[RevokeCertificate] Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('[RevokeCertificate] Transaction confirmed in block:', receipt.blockNumber);
    
    return {
      success: true,
      txHash: tx.hash,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[RevokeCertificate] Error:', errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};
