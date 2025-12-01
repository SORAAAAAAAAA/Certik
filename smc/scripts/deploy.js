const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying CertificateNFT contract to Base Sepolia...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy the contract
  const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
  const certificate = await CertificateNFT.deploy();

  await certificate.waitForDeployment();

  const contractAddress = await certificate.getAddress();
  console.log("CertificateNFT deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-deployment.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", deploymentFile);

  // Export ABI for backend integration
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "CertificateNFT.sol",
    "CertificateNFT.json"
  );
  
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiPath = path.join(__dirname, "..", "abi", "CertificateNFT.json");
    
    const abiDir = path.dirname(abiPath);
    if (!fs.existsSync(abiDir)) {
      fs.mkdirSync(abiDir, { recursive: true });
    }
    
    fs.writeFileSync(
      abiPath,
      JSON.stringify({ abi: artifact.abi, address: contractAddress }, null, 2)
    );
    console.log("ABI exported to:", abiPath);
  }

  console.log("\n=== Deployment Complete ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("\nTo verify the contract, run:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
