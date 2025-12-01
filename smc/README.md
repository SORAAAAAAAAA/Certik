# Certificate NFT Smart Contract

A blockchain-based certificate system built on Base L2 using NFT technology. Each certificate is a unique ERC-721 token with metadata stored on IPFS via Pinata.

## Features

- ✅ **NFT-based Certificates**: Each certificate is a unique, verifiable NFT
- ✅ **IPFS Metadata Storage**: Certificate data stored on Pinata IPFS
- ✅ **Minting & Batch Minting**: Issue single or multiple certificates
- ✅ **Revocation**: Ability to revoke invalid certificates
- ✅ **Public Verification**: Anyone can verify certificate authenticity
- ✅ **Issuer Tracking**: Track who issued each certificate
- ✅ **Timestamp Recording**: Automatic timestamp for each certificate

## Project Structure

```
smc/
├── CertificateNFT.sol          # Main smart contract
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Dependencies
├── scripts/
│   └── deploy.js               # Deployment script
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Base Sepolia ETH** - Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
3. **Wallet Private Key** - Export from MetaMask or your wallet
4. **Pinata Account** - Sign up at [Pinata.cloud](https://pinata.cloud) (free tier available)

## Installation

```bash
cd smc
npm install
```

## Configuration

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Edit `.env` and add your credentials:

```env
PRIVATE_KEY=your_wallet_private_key_here
BASESCAN_API_KEY=your_basescan_api_key  # Optional, for verification
PINATA_JWT=your_pinata_jwt_token        # For backend integration
```

## Deployment

### Deploy to Base Sepolia Testnet

```bash
npm run deploy:sepolia
```

This will:

- Deploy the contract to Base Sepolia
- Save deployment info to `deployments/baseSepolia-deployment.json`
- Export the ABI to `abi/CertificateNFT.json` for backend use

### Verify Contract on BaseScan

After deployment, verify your contract:

```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

## Backend Integration

### Setup

Install dependencies in your backend:

```bash
npm install ethers pinata-web3
```

### Complete Workflow Example

```javascript
const { ethers } = require("ethers");
const { PinataSDK } = require("pinata-web3");
const fs = require("fs");

// 1. Initialize Pinata
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
});

// 2. Initialize Ethers
const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// 3. Load contract
const contractABI = require("./abi/CertificateNFT.json").abi;
const contractAddress = "0x..."; // From deployment
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// 4. Function to issue a certificate
async function issueCertificate(recipientAddress, certificateData) {
  try {
    // Step 1: Upload certificate image to Pinata
    const imageFile = fs.readFileSync(certificateData.imagePath);
    const imageUpload = await pinata.upload.file(imageFile);
    const imageIPFS = `ipfs://${imageUpload.IpfsHash}`;

    console.log("Image uploaded to IPFS:", imageIPFS);

    // Step 2: Create metadata JSON
    const metadata = {
      name: certificateData.name,
      description: certificateData.description,
      image: imageIPFS,
      attributes: [
        {
          trait_type: "Recipient Name",
          value: certificateData.recipientName,
        },
        {
          trait_type: "Course",
          value: certificateData.courseName,
        },
        {
          trait_type: "Issue Date",
          value: new Date().toISOString(),
        },
        {
          trait_type: "Certificate ID",
          value: certificateData.certificateId,
        },
      ],
    };

    // Step 3: Upload metadata to Pinata
    const metadataUpload = await pinata.upload.json(metadata);
    const metadataURI = `ipfs://${metadataUpload.IpfsHash}`;

    console.log("Metadata uploaded to IPFS:", metadataURI);

    // Step 4: Mint certificate NFT
    const tx = await contract.mintCertificate(recipientAddress, metadataURI);
    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Certificate minted! Transaction:", receipt.hash);

    // Extract token ID from event
    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "CertificateMinted"
    );
    const tokenId = event.args.tokenId;

    return {
      success: true,
      tokenId: tokenId.toString(),
      transactionHash: receipt.hash,
      metadataURI,
      imageIPFS,
    };
  } catch (error) {
    console.error("Error issuing certificate:", error);
    throw error;
  }
}

// 5. Function to verify a certificate
async function verifyCertificate(tokenId) {
  try {
    const isValid = await contract.isCertificateValid(tokenId);

    if (!isValid) {
      return {
        valid: false,
        reason: "Certificate does not exist or has been revoked",
      };
    }

    const info = await contract.getCertificateInfo(tokenId);

    return {
      valid: true,
      owner: info.owner,
      issuer: info.issuer,
      metadataURI: info.metadataURI,
      issuedAt: new Date(Number(info.issuedAt) * 1000).toISOString(),
      revoked: info.revoked,
    };
  } catch (error) {
    console.error("Error verifying certificate:", error);
    throw error;
  }
}

// 6. Function to revoke a certificate
async function revokeCertificate(tokenId) {
  try {
    const tx = await contract.revokeCertificate(tokenId);
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error("Error revoking certificate:", error);
    throw error;
  }
}

// Example usage
async function main() {
  // Issue a certificate
  const result = await issueCertificate("0xRecipientAddress", {
    name: "Blockchain Development Certificate",
    description: "Certificate of completion for Blockchain Development Course",
    recipientName: "John Doe",
    courseName: "Advanced Blockchain Development",
    certificateId: "CERT-2024-001",
    imagePath: "./certificate-image.png",
  });

  console.log("Certificate issued:", result);

  // Verify the certificate
  const verification = await verifyCertificate(result.tokenId);
  console.log("Verification result:", verification);
}

module.exports = {
  issueCertificate,
  verifyCertificate,
  revokeCertificate,
};
```

### Express.js API Example

```javascript
const express = require("express");
const {
  issueCertificate,
  verifyCertificate,
  revokeCertificate,
} = require("./certificateService");

const app = express();
app.use(express.json());

// Issue a new certificate
app.post("/api/certificates/issue", async (req, res) => {
  try {
    const { recipientAddress, certificateData } = req.body;
    const result = await issueCertificate(recipientAddress, certificateData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify a certificate
app.get("/api/certificates/:tokenId/verify", async (req, res) => {
  try {
    const { tokenId } = req.params;
    const result = await verifyCertificate(tokenId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Revoke a certificate
app.post("/api/certificates/:tokenId/revoke", async (req, res) => {
  try {
    const { tokenId } = req.params;
    const result = await revokeCertificate(tokenId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Certificate API running on port 3000");
});
```

## Smart Contract Functions

### Minting

- `mintCertificate(address recipient, string metadataURI)` - Mint single certificate
- `batchMintCertificates(address[] recipients, string[] metadataURIs)` - Mint multiple certificates

### Verification

- `isCertificateValid(uint256 tokenId)` - Check if certificate is valid
- `getCertificateInfo(uint256 tokenId)` - Get complete certificate information
- `getCertificateIssuer(uint256 tokenId)` - Get issuer address
- `getIssueTimestamp(uint256 tokenId)` - Get issue timestamp
- `isRevoked(uint256 tokenId)` - Check revocation status

### Management

- `revokeCertificate(uint256 tokenId)` - Revoke a certificate
- `getTotalCertificates()` - Get total number of certificates minted

## Pinata Setup

1. Sign up at [Pinata.cloud](https://pinata.cloud)
2. Go to API Keys section
3. Create a new API key with permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
4. Copy the JWT token to your `.env` file

### Free Tier Limits

- 1 GB storage
- 100 GB bandwidth per month
- Unlimited pins

## Testing on Base Sepolia

1. Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Deploy contract: `npm run deploy:sepolia`
3. View on BaseScan: `https://sepolia.basescan.org/address/<CONTRACT_ADDRESS>`

## Network Information

### Base Sepolia Testnet

- Chain ID: 84532
- RPC URL: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Base Mainnet (Production)

- Chain ID: 8453
- RPC URL: https://mainnet.base.org
- Explorer: https://basescan.org

## Security Considerations

- ✅ Only contract owner can mint certificates
- ✅ Only contract owner can revoke certificates
- ✅ Certificates are non-transferable by default (standard ERC-721)
- ⚠️ Keep your private key secure and never commit it to git
- ⚠️ Test thoroughly on testnet before mainnet deployment
- ⚠️ Consider a security audit before production use

## Troubleshooting

### "Insufficient funds" error

- Make sure you have Base Sepolia ETH in your wallet
- Get testnet ETH from the faucet

### "Invalid private key" error

- Check that your private key in `.env` is correct
- Private key should NOT include "0x" prefix in some cases

### Pinata upload fails

- Verify your Pinata JWT token is correct
- Check your Pinata account limits

## License

MIT
