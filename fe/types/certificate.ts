/**
 * Certificate Types for NFT Metadata
 * Following the ERC-721 Metadata Standard with certificate-specific extensions
 */

// Basic certificate information for the app
export interface CertificateType {
  id: number;
  title: string;
  issuer: string;
  date: string;
  description: string;
  skills: string[];
}

// Certificate input data for creating a new certificate
export interface CertificateInput {
  name: string;
  description: string;
  issuerName: string;
  issuerAddress?: string;
  recipientName: string;
  recipientAddress: string;
  issueDate: string;
  expirationDate?: string;
  skills?: string[];
  category?: string;
  credentialId?: string;
}

// ERC-721 Metadata Standard attributes
export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'string' | 'number' | 'date' | 'boost_percentage' | 'boost_number';
}

// Full NFT Metadata following ERC-721 standard
export interface CertificateMetadata {
  // Required ERC-721 fields
  name: string;
  description: string;
  image: string; // IPFS URI of the certificate image
  
  // Optional ERC-721 fields
  external_url?: string;
  background_color?: string;
  animation_url?: string;
  
  // Certificate-specific extensions
  attributes: NFTAttribute[];
  
  // Additional certificate data
  properties?: {
    issuer: {
      name: string;
      address?: string;
    };
    recipient: {
      name: string;
      address: string;
    };
    certificate: {
      issueDate: string;
      expirationDate?: string;
      credentialId?: string;
      category?: string;
      skills?: string[];
    };
    version: string;
  };
}

// Response from Pinata after pinning
export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

// Upload progress callback
export interface UploadProgress {
  stage: 'preparing' | 'uploading_image' | 'creating_metadata' | 'uploading_metadata' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

// Result of certificate upload
export interface CertificateUploadResult {
  success: boolean;
  imageIpfsHash?: string;
  imageUri?: string;
  metadataIpfsHash?: string;
  metadataUri?: string;
  error?: string;
}

// Image source type for React Native
export interface ImageSource {
  uri: string;
  type?: string;
  name?: string;
}
