const hre = require("hardhat");

// ⚡ UPDATED ADDRESSES - New secured deployment
const MOCK_METH_ADDRESS = "0x0f24a4C0Cf713379a11Ea9201Ca306c1b19BE33b";
const AGRO_BOND_ADDRESS = "0xeaeaE47163c9dd84345F2975B6817674e79F5799";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("🏦 Desplegando Mercado con:", deployer.address);

    // 1. Desplegar Liquidity Pool
    const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
    const pool = await LiquidityPool.deploy(MOCK_METH_ADDRESS, AGRO_BOND_ADDRESS);
    await pool.waitForDeployment();
    const poolAddress = await pool.getAddress();
    console.log("✅ LiquidityPool deployed to:", poolAddress);

    // 2. "SEEDING" (Sembrar el dinero)
    console.log("💧 Inyectando liquidez inicial...");

    const mETH = await hre.ethers.getContractAt("MockMETH", MOCK_METH_ADDRESS);

    // Transferimos tokens del Admin al Pool
    const seedAmount = hre.ethers.parseEther("500000"); // 500k

    const tx = await mETH.transfer(poolAddress, seedAmount);
    await tx.wait();

    console.log(`💰 Pool fondeado con ${hre.ethers.formatEther(seedAmount)} mETH`);

    console.log("\n🎉 ¡MERCADO COMPLETADO!");
    console.log("================================");
    console.log("LiquidityPool:", poolAddress);
    console.log("Liquidez:", hre.ethers.formatEther(seedAmount), "mETH");
    console.log("================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
