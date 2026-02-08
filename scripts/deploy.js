const hre = require("hardhat");

async function main() {
    console.log("Deploying WasteCoin contract to Sepolia testnet...");

    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Get account balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

    // Deploy the contract
    const WasteCoin = await hre.ethers.getContractFactory("WasteCoin");
    const wasteCoin = await WasteCoin.deploy();

    await wasteCoin.waitForDeployment();

    const contractAddress = await wasteCoin.getAddress();
    console.log("WasteCoin deployed to:", contractAddress);

    // Display contract info
    const name = await wasteCoin.name();
    const symbol = await wasteCoin.symbol();
    const decimals = await wasteCoin.decimals();

    console.log("\nContract Details:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Decimals:", decimals);
    console.log("\n✅ Deployment successful!");
    console.log("\n📝 Next steps:");
    console.log("1. Add this to your .env.local file:");
    console.log(`   WASTE_COIN_CONTRACT_ADDRESS=${contractAddress}`);
    console.log("\n2. Verify the contract on Etherscan (optional):");
    console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
