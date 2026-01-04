import hre from "hardhat";

async function main() {
    console.log("🚀 Iniciando Despliegue Agro-Bond en Mantle Sepolia...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("👨‍🌾 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "MNT\n");

    // 1. Deploy Mock mETH
    console.log("📝 Deploying MockMETH...");
    const MockMETH = await hre.ethers.getContractFactory("MockMETH");
    const mETH = await MockMETH.deploy();
    await mETH.waitForDeployment();
    const mETHAddress = await mETH.getAddress();
    console.log("✅ MockMETH deployed to:", mETHAddress);

    // 2. Deploy Oracle
    console.log("\n📝 Deploying AgroRiskOracle...");
    const AgroRiskOracle = await hre.ethers.getContractFactory("AgroRiskOracle");
    const oracle = await AgroRiskOracle.deploy();
    await oracle.waitForDeployment();
    const oracleAddress = await oracle.getAddress();
    console.log("✅ AgroRiskOracle deployed to:", oracleAddress);

    // 3. Deploy Bond (conectado al Oracle)
    console.log("\n📝 Deploying AgroBond...");
    const AgroBond = await hre.ethers.getContractFactory("AgroBond");
    const bond = await AgroBond.deploy(oracleAddress);
    await bond.waitForDeployment();
    const bondAddress = await bond.getAddress();
    console.log("✅ AgroBond deployed to:", bondAddress);

    console.log("\n🎉 ¡DESPLIEGUE COMPLETO!");
    console.log("================================");
    console.log("MockMETH:        ", mETHAddress);
    console.log("AgroRiskOracle:  ", oracleAddress);
    console.log("AgroBond:        ", bondAddress);
    console.log("================================");
    console.log("\n🔗 Explorer: https://explorer.sepolia.mantle.xyz");
    console.log("🔍 Verifica tus contratos en el explorer usando las direcciones de arriba");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
