const hre = require("hardhat");

async function main() {
  console.log("Starting Piggy Watt contract deployment...");

  // Compile contract
  await hre.run("compile");

  // Check deployer address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", await deployer.getAddress());

  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(
    await deployer.getAddress()
  );
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "BNB");

  // Deploy PiggyWatt contract
  const PiggyWattFactory = await hre.ethers.getContractFactory("PiggyWatt");
  const PiggyWatt = await PiggyWattFactory.deploy();

  await PiggyWatt.waitForDeployment();

  console.log("✅ Piggy Watt contract deployed successfully!");
  console.log("Contract address:", await PiggyWatt.getAddress());
  console.log(
    "Deployment transaction:",
    PiggyWatt.deploymentTransaction().hash
  );

  // Display network information
  const network = await hre.network.provider.send("eth_chainId");
  console.log("Network chain ID:", parseInt(network, 16));

  // Check contract information
  console.log("\n=== Contract Information ===");
  console.log("Token name:", await PiggyWatt.name());
  console.log("Token symbol:", await PiggyWatt.symbol());
  console.log("Decimal places:", await PiggyWatt.decimals());
  console.log("Owner:", await PiggyWatt.owner());

  // Post-deployment setup (optional)
  console.log("\n=== Initial Setup Complete ===");
  console.log("Piggy Watt system deployed successfully!");

  // Output information for contract verification
  console.log("\n=== Contract Verification Command ===");
  console.log(
    `npx hardhat verify --network ${
      hre.network.name
    } ${await PiggyWatt.getAddress()}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error occurred during deployment:", error);
    process.exit(1);
  });
