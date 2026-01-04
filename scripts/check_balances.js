const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const userAddress = deployer.address;

    console.log("🔍 Verificando balances para:", userAddress);
    console.log("====================================\n");

    // NEW CONTRACT ADDRESSES
    const NEW_AGRO_BOND = "0xeaeaE47163c9dd84345F2975B6817674e79F5799";
    const OLD_AGRO_BOND = "0x2ec3370dC882E8c243ed3F8Eb425033aF54BCD05";

    const AgroBond = await hre.ethers.getContractFactory("AgroBond");

    // Check NEW contract
    console.log("📊 NEW AgroBond Contract:", NEW_AGRO_BOND);
    const newBond = AgroBond.attach(NEW_AGRO_BOND);
    const newSeniorBalance = await newBond.balanceOf(userAddress, 1);
    const newJuniorBalance = await newBond.balanceOf(userAddress, 2);
    console.log("  Senior Bonds (ID 1):", newSeniorBalance.toString());
    console.log("  Junior Bonds (ID 2):", newJuniorBalance.toString());

    console.log("\n📊 OLD AgroBond Contract:", OLD_AGRO_BOND);
    const oldBond = AgroBond.attach(OLD_AGRO_BOND);
    const oldSeniorBalance = await oldBond.balanceOf(userAddress, 1);
    const oldJuniorBalance = await oldBond.balanceOf(userAddress, 2);
    console.log("  Senior Bonds (ID 1):", oldSeniorBalance.toString());
    console.log("  Junior Bonds (ID 2):", oldJuniorBalance.toString());

    console.log("\n====================================");
    if (newSeniorBalance > 0n) {
        console.log("✅ Tienes bonds en el contrato NUEVO - Todo OK!");
    } else if (oldSeniorBalance > 0n) {
        console.log("⚠️ Tus bonds están en el contrato VIEJO - Necesitas mintear de nuevo");
    } else {
        console.log("❌ No tienes bonds en ningún contrato");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
