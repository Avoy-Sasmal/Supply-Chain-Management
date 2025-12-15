import hre from "hardhat";

async function main() {
  console.log("Deploying SupplyChain contract...");

  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();

  await supplyChain.waitForDeployment();

  const address = await supplyChain.getAddress();
  console.log("SupplyChain deployed to:", address);
  console.log("\nCopy this address to use in your frontend:");
  console.log(address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

