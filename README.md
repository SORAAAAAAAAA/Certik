# Certik - Blockchain Certificate System

A blockchain-based certificate verification system built on Base L2, allowing secure issuance and verification of certificates as NFTs with metadata stored on IPFS.

## 🚀 Deployed Smart Contract

### Base Sepolia Testnet

- **Contract Address**: `0x1b36756bC80Cbdeca3Fc88FF9eb3F11Fb915daE7`
- **Network**: Base Sepolia (Chain ID: 84532)
- **Verified Contract**: [View on BaseScan](https://sepolia.basescan.org/address/0x1b36756bC80Cbdeca3Fc88FF9eb3F11Fb915daE7#code)
- **Interact with Contract**: [Write Contract](https://sepolia.basescan.org/address/0x1b36756bC80Cbdeca3Fc88FF9eb3F11Fb915daE7#writeContract)

## 📋 Project Structure

```
Certik/
├── fe/                 # Frontend application
├── smc/                # Smart contracts
│   ├── contracts/      # Solidity contracts
│   ├── scripts/        # Deployment scripts
│   ├── abi/            # Contract ABIs for backend integration
│   └── README.md       # Smart contract documentation
└── README.md           # This file
```

## 🔧 Smart Contract Features

- ✅ **Certificate Minting**: Issue unique certificates as ERC-721 NFTs
- ✅ **Batch Minting**: Issue multiple certificates in one transaction
- ✅ **IPFS Integration**: Store certificate metadata on Pinata IPFS
- ✅ **Revocation System**: Invalidate fraudulent or invalid certificates
- ✅ **Public Verification**: Anyone can verify certificate authenticity on-chain
- ✅ **Issuer Tracking**: Track who issued each certificate
- ✅ **Timestamp Recording**: Automatic issue date tracking

## 🌐 Network Information

### Base Sepolia Testnet (Current)

- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Faucet**: [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

### Base Mainnet (Production Ready)

- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Explorer**: https://basescan.org

## 📦 Smart Contract Setup

For detailed smart contract documentation, deployment instructions, and backend integration examples, see [smc/README.md](smc/README.md).

### Quick Start

```bash
# Navigate to smart contracts directory
cd smc

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your PRIVATE_KEY

# Deploy to Base Sepolia
npm run deploy:sepolia

# Verify contract
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

## 🔗 Contract Integration

The contract ABI is available at `smc/abi/CertificateNFT.json` for backend integration.

### Key Contract Functions

```solidity
// Mint a certificate
function mintCertificate(address recipient, string memory metadataURI)
    returns (uint256 tokenId)

// Batch mint certificates
function batchMintCertificates(address[] recipients, string[] metadataURIs)
    returns (uint256[] tokenIds)

// Revoke a certificate
function revokeCertificate(uint256 tokenId)

// Verify certificate validity
function isCertificateValid(uint256 tokenId)
    returns (bool)

// Get certificate information
function getCertificateInfo(uint256 tokenId)
    returns (owner, issuer, metadataURI, issuedAt, isValid, revoked)
```

## 🎨 Frontend

The frontend application is located in the `fe/` directory.

## 📝 Backend Integration

### Workflow

1. **Upload certificate image** to Pinata IPFS
2. **Create metadata JSON** with certificate details
3. **Upload metadata** to Pinata IPFS
4. **Call `mintCertificate`** with recipient address and metadata URI
5. **Receive token ID** for the newly minted certificate

### Example Integration

```javascript
const { ethers } = require("ethers");
const contractABI = require("./smc/abi/CertificateNFT.json").abi;

const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  "0x1b36756bC80Cbdeca3Fc88FF9eb3F11Fb915daE7",
  contractABI,
  wallet
);

// Mint a certificate
const tx = await contract.mintCertificate(
  recipientAddress,
  "ipfs://QmYourMetadataHash"
);
await tx.wait();
```

For complete backend integration examples including Pinata setup, see [smc/README.md](smc/README.md).

## 🔐 Security

- Only contract owner can mint and revoke certificates
- All certificate actions are logged via events
- Certificate data is immutable once minted
- Public verification ensures transparency

## 📄 License

MIT

## 🔗 Useful Links

- **Contract on BaseScan**: https://sepolia.basescan.org/address/0x1b36756bC80Cbdeca3Fc88FF9eb3F11Fb915daE7
- **Write Contract Interface**: https://sepolia.basescan.org/address/0x1b36756bC80Cbdeca3Fc88FF9eb3F11Fb915daE7#writeContract
- **Read Contract Interface**: https://sepolia.basescan.org/address/0x1b36756bC80Cbdeca3Fc88FF9eb3F11Fb915daE7#readContract
- **Base Documentation**: https://docs.base.org
- **Pinata Documentation**: https://docs.pinata.cloud
