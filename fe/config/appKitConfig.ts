// src/AppKitConfig.ts (or wherever you prefer to configure it)
import "@walletconnect/react-native-compat";

import { createAppKit, AppKitNetwork } from '@reown/appkit-react-native';
import { EthersAdapter } from '@reown/appkit-ethers-react-native';
import { Storage } from '@/utils/appkit/storage/util.storage'

const projectId = '40bdf0486f6c84c5a676eee161129680'; // Obtain from https://dashboard.reown.com/

const ethersAdapter = new EthersAdapter();


// Base Sepolia testnet configuration
const baseChain: AppKitNetwork = {
  id: 84532,
  name: 'Base Sepolia',
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:84532',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorers: {
    default: {
      name: 'Basescan',
      url: 'https://sepolia.basescan.org',
    },
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
  },
};

export const appKit = createAppKit({
  projectId,
  networks: [baseChain],
  defaultNetwork: baseChain,
  adapters: [ethersAdapter],
  storage: Storage,

  // Enable debug mode for troubleshooting
  debug: true,
  enableAnalytics: true,

  // Other AppKit options (e.g., metadata for your dApp)
  metadata: {
    name: 'Certik dApp',
    description: 'A decentralized application for on-chain certification.',
    url: 'https://localhost',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
    redirect: {
      native: "certik://",
      universal: "https://localhost",
    },
  }
});