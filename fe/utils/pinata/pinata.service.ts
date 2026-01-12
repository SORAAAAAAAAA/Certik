/**
 * Pinata IPFS Service
 * Handles uploading files and JSON metadata to Pinata/IPFS
 */

import { PINATA_CONFIG, isPinataConfigured } from '@/config/pinataConfig';
import {
  PinataResponse,
  CertificateMetadata,
  CertificateInput,
  NFTAttribute,
  CertificateUploadResult,
  UploadProgress,
  ImageSource,
} from '@/types/certificate';

/**
 * Get authorization headers for Pinata API
 */
const getAuthHeaders = (): HeadersInit => {
  if (PINATA_CONFIG.JWT) {
    return {
      Authorization: `Bearer ${PINATA_CONFIG.JWT}`,
    };
  }
  return {
    pinata_api_key: PINATA_CONFIG.API_KEY,
    pinata_secret_api_key: PINATA_CONFIG.API_SECRET,
  };
};

/**
 * Test Pinata authentication
 */
export const testPinataAuth = async (): Promise<boolean> => {
  if (!isPinataConfigured()) {
    console.error('Pinata is not configured. Please set environment variables.');
    return false;
  }

  try {
    const response = await fetch(PINATA_CONFIG.ENDPOINTS.TEST_AUTH, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch (error) {
    console.error('Pinata auth test failed:', error);
    return false;
  }
};

/**
 * Upload an image file to Pinata IPFS
 * @param imageSource - Image source object with uri, type, and name
 * @param metadata - Optional metadata for the pin
 * @returns PinataResponse with IPFS hash
 */
export const uploadImageToPinata = async (
  imageSource: ImageSource,
  metadata?: { name?: string; keyvalues?: Record<string, string> }
): Promise<PinataResponse> => {
  if (!isPinataConfigured()) {
    throw new Error('Pinata is not configured. Please set environment variables.');
  }

  const formData = new FormData();

  // Create file blob from URI (React Native compatible)
  const fileBlob = {
    uri: imageSource.uri,
    type: imageSource.type || 'image/png',
    name: imageSource.name || `certificate_${Date.now()}.png`,
  } as any;

  formData.append('file', fileBlob);

  // Add pinata metadata if provided
  if (metadata) {
    const pinataMetadata = {
      name: metadata.name || `certificate_image_${Date.now()}`,
      keyvalues: metadata.keyvalues || {},
    };
    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
  }

  // Pinata options
  const pinataOptions = {
    cidVersion: 1,
  };
  formData.append('pinataOptions', JSON.stringify(pinataOptions));

  const response = await fetch(PINATA_CONFIG.ENDPOINTS.PIN_FILE, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      // Don't set Content-Type for FormData - let the browser set it
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload image to Pinata: ${response.status} - ${errorText}`);
  }

  return response.json();
};

/**
 * Upload JSON metadata to Pinata IPFS
 * @param jsonData - JSON data to upload
 * @param options - Pinata metadata options
 * @returns PinataResponse with IPFS hash
 */
export const uploadJSONToPinata = async (
  jsonData: object,
  options?: { name?: string; keyvalues?: Record<string, string> }
): Promise<PinataResponse> => {
  if (!isPinataConfigured()) {
    throw new Error('Pinata is not configured. Please set environment variables.');
  }

  const body = {
    pinataContent: jsonData,
    pinataMetadata: {
      name: options?.name || `metadata_${Date.now()}.json`,
      keyvalues: options?.keyvalues || {},
    },
    pinataOptions: {
      cidVersion: 1,
    },
  };

  const response = await fetch(PINATA_CONFIG.ENDPOINTS.PIN_JSON, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload JSON to Pinata: ${response.status} - ${errorText}`);
  }

  return response.json();
};

/**
 * Unpin content from Pinata
 * @param ipfsHash - The IPFS hash to unpin
 */
export const unpinFromPinata = async (ipfsHash: string): Promise<void> => {
  if (!isPinataConfigured()) {
    throw new Error('Pinata is not configured.');
  }

  const response = await fetch(`${PINATA_CONFIG.ENDPOINTS.UNPIN}/${ipfsHash}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to unpin from Pinata: ${response.status}`);
  }
};

/**
 * Get IPFS gateway URL for a hash
 * @param ipfsHash - The IPFS hash
 * @returns Full gateway URL
 */
export const getIPFSUrl = (ipfsHash: string): string => {
  return `${PINATA_CONFIG.GATEWAY_URL}/${ipfsHash}`;
};

/**
 * Get IPFS URI (ipfs://) for a hash
 * @param ipfsHash - The IPFS hash
 * @returns IPFS URI
 */
export const getIPFSUri = (ipfsHash: string): string => {
  return `ipfs://${ipfsHash}`;
};

/**
 * Create NFT metadata attributes from certificate input
 */
const createMetadataAttributes = (input: CertificateInput): NFTAttribute[] => {
  const attributes: NFTAttribute[] = [
    { trait_type: 'Issuer', value: input.issuerName },
    { trait_type: 'Recipient', value: input.recipientName },
    { trait_type: 'Issue Date', value: input.issueDate, display_type: 'date' },
  ];

  if (input.expirationDate) {
    attributes.push({
      trait_type: 'Expiration Date',
      value: input.expirationDate,
      display_type: 'date',
    });
  }

  if (input.category) {
    attributes.push({ trait_type: 'Category', value: input.category });
  }

  if (input.credentialId) {
    attributes.push({ trait_type: 'Credential ID', value: input.credentialId });
  }

  if (input.skills && input.skills.length > 0) {
    input.skills.forEach((skill, index) => {
      attributes.push({ trait_type: `Skill ${index + 1}`, value: skill });
    });
  }

  return attributes;
};

/**
 * Create certificate metadata following ERC-721 standard
 * @param input - Certificate input data
 * @param imageIpfsHash - IPFS hash of the certificate image
 * @returns CertificateMetadata object
 */
export const createCertificateMetadata = (
  input: CertificateInput,
  imageIpfsHash: string
): CertificateMetadata => {
  return {
    name: input.name,
    description: input.description,
    image: getIPFSUri(imageIpfsHash),
    external_url: `https://certik.app/certificate/${input.credentialId || 'view'}`,
    attributes: createMetadataAttributes(input),
    properties: {
      issuer: {
        name: input.issuerName,
        address: input.issuerAddress,
      },
      recipient: {
        name: input.recipientName,
        address: input.recipientAddress,
      },
      certificate: {
        issueDate: input.issueDate,
        expirationDate: input.expirationDate,
        credentialId: input.credentialId,
        category: input.category,
        skills: input.skills,
      },
      version: '1.0.0',
    },
  };
};

/**
 * Upload a complete certificate to IPFS (image + metadata)
 * This is the main function to use for minting certificates
 * 
 * @param imageSource - Image source for the certificate
 * @param certificateInput - Certificate data
 * @param onProgress - Optional progress callback
 * @returns CertificateUploadResult with IPFS hashes and URIs
 */
export const uploadCertificateToIPFS = async (
  imageSource: ImageSource,
  certificateInput: CertificateInput,
  onProgress?: (progress: UploadProgress) => void
): Promise<CertificateUploadResult> => {
  try {
    // Stage 1: Preparing
    onProgress?.({
      stage: 'preparing',
      progress: 10,
      message: 'Preparing certificate for upload...',
    });

    // Validate inputs
    if (!imageSource.uri) {
      throw new Error('Image source is required');
    }
    if (!certificateInput.name || !certificateInput.recipientAddress) {
      throw new Error('Certificate name and recipient address are required');
    }

    // Stage 2: Upload image
    onProgress?.({
      stage: 'uploading_image',
      progress: 30,
      message: 'Uploading certificate image to IPFS...',
    });

    const imageResponse = await uploadImageToPinata(imageSource, {
      name: `cert_image_${certificateInput.name.replace(/\s+/g, '_')}`,
      keyvalues: {
        type: 'certificate_image',
        recipient: certificateInput.recipientAddress,
      },
    });

    const imageIpfsHash = imageResponse.IpfsHash;

    // Stage 3: Create metadata
    onProgress?.({
      stage: 'creating_metadata',
      progress: 60,
      message: 'Creating certificate metadata...',
    });

    const metadata = createCertificateMetadata(certificateInput, imageIpfsHash);

    // Stage 4: Upload metadata
    onProgress?.({
      stage: 'uploading_metadata',
      progress: 80,
      message: 'Uploading metadata to IPFS...',
    });

    const metadataResponse = await uploadJSONToPinata(metadata, {
      name: `cert_metadata_${certificateInput.name.replace(/\s+/g, '_')}`,
      keyvalues: {
        type: 'certificate_metadata',
        recipient: certificateInput.recipientAddress,
        imageHash: imageIpfsHash,
      },
    });

    const metadataIpfsHash = metadataResponse.IpfsHash;

    // Stage 5: Complete
    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Certificate uploaded successfully!',
    });

    return {
      success: true,
      imageIpfsHash,
      imageUri: getIPFSUri(imageIpfsHash),
      metadataIpfsHash,
      metadataUri: getIPFSUri(metadataIpfsHash),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    onProgress?.({
      stage: 'error',
      progress: 0,
      message: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
};
