import { NextResponse } from "next/server";
import { ethers } from "ethers";

// Corporate Database
const CORPORATE_DATABASE: Record<string, { tier: number, multiplier: number }> = {
    "WALMART_INC": { tier: 1, multiplier: 1.0 },
    "WHOLE_FOODS": { tier: 1, multiplier: 0.98 },
    "COSTCO_WHOLESALE": { tier: 1, multiplier: 0.99 },
    "TARGET_CORP": { tier: 1, multiplier: 0.97 },
    "TIENDA_LOCAL_SPA": { tier: 2, multiplier: 0.85 },
    "COMERCIAL_MEDIANO": { tier: 2, multiplier: 0.80 },
    "EMPRESA_FANTASMA": { tier: 3, multiplier: 0.0 },
    "DEUDOR_MOROSO": { tier: 3, multiplier: 0.0 }
};

// ⚡ UPDATED CONTRACT ADDRESSES - Secured deployment
const ORACLE_ADDRESS = "0xcD95a0422C026f342c914293aa207fE6Cad6B8BA";
const MANTLE_SEPOLIA_CHAIN_ID = 5003;

function calculateRiskScore(payerName: string, amount: number, invoiceDate: string) {
    const companyInfo = CORPORATE_DATABASE[payerName];
    let calculatedScore = 0;

    if (!companyInfo) {
        calculatedScore = 40;
    } else if (companyInfo.tier === 3) {
        calculatedScore = 0;
    } else {
        let baseScore = 90 * companyInfo.multiplier;

        if (amount > 100000) {
            baseScore -= 15;
        }

        const invoiceDateObj = new Date(invoiceDate);
        const today = new Date();
        const daysOld = Math.floor((today.getTime() - invoiceDateObj.getTime()) / (1000 * 60 * 60 * 24));

        if (daysOld > 90) {
            const agePenalty = Math.min(20, Math.floor((daysOld - 90) / 10));
            baseScore -= agePenalty;
        }

        const marketVolatility = Math.floor(Math.random() * 7) - 3;
        baseScore += marketVolatility;

        calculatedScore = Math.floor(baseScore);
    }

    if (calculatedScore > 100) calculatedScore = 100;
    if (calculatedScore < 0) calculatedScore = 0;

    const isApproved = calculatedScore > 60;

    return { score: calculatedScore, isApproved };
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userAddress, docName, extractedData, nonce } = body;

        const invoiceData = extractedData || {
            payerName: "WALMART_INC",
            amount: 50000,
            date: "2024-01-01"
        };

        console.log("🔍 Analizando riesgo para:", invoiceData.payerName);

        const { score, isApproved } = calculateRiskScore(
            invoiceData.payerName,
            invoiceData.amount,
            invoiceData.date
        );

        let signature = "0x";
        let docId = "";

        if (isApproved) {
            // GENERAR FIRMA SEGURA con anti-replay protections
            try {
                const privateKey = process.env.PRIVATE_KEY;

                if (!privateKey) {
                    console.error("❌ PRIVATE_KEY no encontrada en .env");
                    throw new Error("PRIVATE_KEY no configurada");
                }

                const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
                const wallet = new ethers.Wallet(formattedKey);

                console.log("🔐 Oracle signer address:", wallet.address);

                // Generate unique docId
                docId = `INV-${Date.now()}-${invoiceData.payerName}`;

                // Use provided nonce or default to 0
                const userNonce = nonce !== undefined ? nonce : 0;

                // CRITICAL: Must match contract's hash construction EXACTLY
                // Contract: keccak256(abi.encodePacked(user, riskScore, docId, nonce, chainId, oracleAddress))
                const messageHash = ethers.solidityPackedKeccak256(
                    ["address", "uint256", "string", "uint256", "uint256", "address"],
                    [
                        userAddress,
                        score,
                        docId,
                        userNonce,                    // Anti-replay: nonce
                        MANTLE_SEPOLIA_CHAIN_ID,     // Anti-replay: chainId
                        ORACLE_ADDRESS                // Anti-replay: contract address
                    ]
                );

                // Sign with Ethereum prefix (ethers.js adds it automatically)
                signature = await wallet.signMessage(ethers.getBytes(messageHash));

                console.log("✅ Firma SEGURA generada:", {
                    user: userAddress,
                    riskScore: score,
                    docId: docId,
                    nonce: userNonce,
                    chainId: MANTLE_SEPOLIA_CHAIN_ID,
                    signature: signature.substring(0, 20) + "..." + signature.slice(-10)
                });

            } catch (signError: any) {
                console.error("❌ Error generando firma:", signError.message);
                return NextResponse.json(
                    { success: false, error: `Signature generation failed: ${signError.message}` },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            payer: invoiceData.payerName,
            riskScore: score,
            isApproved,
            signature,
            docId,
            reason: isApproved
                ? "Creditworthiness Verified"
                : score === 0
                    ? "Blacklisted entity - Automatic rejection"
                    : "High Risk Detected: Insufficient creditworthiness"
        });

    } catch (error: any) {
        console.error("❌ Error en análisis:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Analysis Failed" },
            { status: 500 }
        );
    }
}
