import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AgroBondModule = buildModule("AgroBondModule", (m) => {
    // 1. Deploy Mock mETH
    const mETH = m.contract("MockMETH");

    // 2. Deploy Oracle
    const oracle = m.contract("AgroRiskOracle");

    // 3. Deploy Bond (conectado al Oracle)
    const bond = m.contract("AgroBond", [oracle]);

    return { mETH, oracle, bond };
});

export default AgroBondModule;
