import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { ethers } = hre;

async function main() {
  console.log("Deploying contracts...");

  // Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log(`MockUSDC deployed to: ${usdcAddress}`);

  // Deploy RelationshipManager
  const RelationshipManager = await ethers.getContractFactory("RelationshipManager");
  const relationshipManager = await RelationshipManager.deploy(usdcAddress);
  await relationshipManager.waitForDeployment();
  const relationshipManagerAddress = await relationshipManager.getAddress();
  console.log(`RelationshipManager deployed to: ${relationshipManagerAddress}`);

  // Network info
  const network = await ethers.provider.getNetwork();

  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    mockUSDC: usdcAddress,
    relationshipManager: relationshipManagerAddress,
    deployedAt: new Date().toISOString(),
  };

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Save ABIs
  const abisDir = path.join(__dirname, "..", "src", "lib", "abis");
  if (!fs.existsSync(abisDir)) {
    fs.mkdirSync(abisDir, { recursive: true });
  }

  const RelationshipManagerArtifact = require(
    "../artifacts/contracts/RelationshipManager.sol/RelationshipManager.json"
  );
  const MockUSDCArtifact = require(
    "../artifacts/contracts/MockUSDC.sol/MockUSDC.json"
  );

  fs.writeFileSync(
    path.join(abisDir, "RelationshipManager.json"),
    JSON.stringify(RelationshipManagerArtifact.abi, null, 2)
  );
  fs.writeFileSync(
    path.join(abisDir, "MockUSDC.json"),
    JSON.stringify(MockUSDCArtifact.abi, null, 2)
  );

  console.log("ABIs saved to src/lib/abis/");
  console.log("\nDeployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
