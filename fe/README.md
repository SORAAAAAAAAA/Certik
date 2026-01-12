# Certik - Certificate NFT Mobile App 📜

A mobile application for uploading certificates to the blockchain as NFTs on Base L2.

## Features

- 🔐 Wallet connection via WalletConnect/AppKit
- 📤 Upload certificate images to IPFS via Pinata
- 🎨 Automatic NFT metadata generation (ERC-721 compliant)
- ⛓️ Mint certificates as NFTs on Base Sepolia
- ✅ Certificate verification on-chain

## Get started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Configure environment variables

   Create a `.env` file based on `.env.example`:

   ```bash
   # Pinata API Configuration (get from https://app.pinata.cloud/developers/api-keys)
   EXPO_PUBLIC_PINATA_JWT=your_pinata_jwt_token
   
   # Optional: Alternative Pinata auth method
   EXPO_PUBLIC_PINATA_API_KEY=your_api_key
   EXPO_PUBLIC_PINATA_API_SECRET=your_api_secret
   
   # Optional: Custom IPFS Gateway
   EXPO_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs
   
   # Smart Contract Address (deployed on Base Sepolia)
   EXPO_PUBLIC_CONTRACT_ADDRESS=your_contract_address
   ```

3. Start the app

   ```bash
   pnpm start
   ```

## Pinata Integration

This app uses Pinata to store certificate images and metadata on IPFS.

### How it works

1. **Upload Image**: When you create a certificate, the image is uploaded to Pinata IPFS
2. **Create Metadata**: NFT metadata (ERC-721 compliant) is generated with the IPFS image URI
3. **Upload Metadata**: The metadata JSON is uploaded to Pinata IPFS
4. **Mint NFT**: The metadata IPFS URI is used to mint the certificate NFT

### Usage Example

```typescript
import { useCertificateMint } from '@/hooks/useCertificateMint';
import { pickImageFromLibrary } from '@/utils/imagePicker';

const { mintCertificate, progress, result } = useCertificateMint();

// Pick an image
const imageResult = await pickImageFromLibrary();

// Mint the certificate
const result = await mintCertificate(
  imageResult.imageSource,
  {
    name: 'React Native Certificate',
    description: 'Completion certificate for React Native course',
    issuerName: 'Academy',
    recipientName: 'John Doe',
    recipientAddress: '0x...',
    issueDate: '2025-01-12',
    skills: ['React Native', 'Mobile Development'],
  },
  provider // from wallet connection
);

console.log('Minted Token ID:', result.tokenId);
console.log('Metadata URI:', result.metadataUri);
```

## Project Structure

```
fe/
├── app/                    # Expo Router pages
├── components/
│   └── certificate/        # Certificate upload components
├── config/
│   ├── appKitConfig.ts     # WalletConnect configuration
│   └── pinataConfig.ts     # Pinata API configuration
├── hooks/
│   ├── useCertificateUpload.ts  # IPFS upload hook
│   └── useCertificateMint.ts    # Full mint flow hook
├── types/
│   └── certificate.ts      # Certificate & NFT metadata types
└── utils/
    ├── imagePicker.ts      # Image selection utilities
    ├── pinata/
    │   └── pinata.service.ts    # Pinata IPFS service
    └── blockchain/
        └── certificate.service.ts  # Smart contract interaction
```

## Smart Contract

The CertificateNFT smart contract is deployed on Base Sepolia. See `/smc` folder for contract source.

Key functions:
- `mintCertificate(recipient, metadataURI)` - Mint a new certificate NFT
- `getCertificateInfo(tokenId)` - Get certificate details
- `isCertificateValid(tokenId)` - Check if certificate is valid
- `revokeCertificate(tokenId)` - Revoke a certificate (owner only)
