// Pinata Configuration
// Get your API keys from https://app.pinata.cloud/developers/api-keys

export const PINATA_CONFIG = {
  // Pinata API JWT Token (recommended for authentication)
  JWT: process.env.EXPO_PUBLIC_PINATA_JWT || '',
  
  // Alternative: API Key + Secret (if not using JWT)
  API_KEY: process.env.EXPO_PUBLIC_PINATA_API_KEY || '',
  API_SECRET: process.env.EXPO_PUBLIC_PINATA_API_SECRET || '',
  
  // Pinata Gateway URL for accessing IPFS content
  GATEWAY_URL: process.env.EXPO_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs',
  
  // API Endpoints
  ENDPOINTS: {
    PIN_FILE: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
    PIN_JSON: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    UNPIN: 'https://api.pinata.cloud/pinning/unpin',
    TEST_AUTH: 'https://api.pinata.cloud/data/testAuthentication',
  },
};

// Validate configuration
export const isPinataConfigured = (): boolean => {
  return !!(PINATA_CONFIG.JWT || (PINATA_CONFIG.API_KEY && PINATA_CONFIG.API_SECRET));
};
