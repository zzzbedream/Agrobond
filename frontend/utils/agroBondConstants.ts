import { type Address } from "viem";

export const MANTLE_NETWORK = {
    id: 5003,
    name: "Mantle Sepolia",
    rpcUrl: "https://rpc.sepolia.mantle.xyz",
    explorerUrl: "https://explorer.sepolia.mantle.xyz",
    nativeCurrency: { name: "Mantle", symbol: "MNT", decimals: 18 },
} as const;

// ⚡ UPDATED ADDRESSES - Secured Contracts Deployed 2026-01-02
// FINAL FIX: LiquidityPool now points to correct AgroBond
export const CONTRACT_ADDRESSES = {
    AGRO_BOND: "0xeaeaE47163c9dd84345F2975B6817674e79F5799" as Address,
    LIQUIDITY_POOL: "0x9B3788b2DD3172f64976a7c7Cb8b521BF8ddAfCB" as Address,
    CASH_TOKEN: "0x0f24a4C0Cf713379a11Ea9201Ca306c1b19BE33b" as Address,
    ORACLE: "0xcD95a0422C026f342c914293aa207fE6Cad6B8BA" as Address,
} as const;

// ABIs con tipos completos para mejor type inference
export const AGRO_BOND_ABI = [
    {
        name: "mintBond",
        type: "function",
        inputs: [
            { name: "invoiceAmount", type: "uint256" },
            { name: "riskScore", type: "uint256" },
            { name: "docId", type: "string" },
            { name: "signature", type: "bytes" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    },
    {
        name: "balanceOf",
        type: "function",
        inputs: [
            { name: "account", type: "address" },
            { name: "id", type: "uint256" }
        ],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view"
    },
    {
        name: "setApprovalForAll",
        type: "function",
        inputs: [
            { name: "operator", type: "address" },
            { name: "approved", type: "bool" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const;

// Oracle ABI for getNonce
export const ORACLE_ABI = [
    {
        name: "getNonce",
        type: "function",
        inputs: [{ name: "user", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view"
    },
    {
        name: "verifyRisk",
        type: "function",
        inputs: [
            { name: "user", type: "address" },
            { name: "riskScore", type: "uint256" },
            { name: "docId", type: "string" },
            { name: "signature", type: "bytes" }
        ],
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable"
    }
] as const;

export const LIQUIDITY_POOL_ABI = [
    {
        name: "sellSeniorBond",
        type: "function",
        inputs: [{ name: "amount", type: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable"
    },
    {
        name: "cashToken",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view"
    }
] as const;

export const ERC20_ABI = [
    {
        name: "balanceOf",
        type: "function",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view"
    }
] as const;

export const BOND_TOKEN_IDS = {
    SENIOR: 1n,
    JUNIOR: 2n,
} as const;
