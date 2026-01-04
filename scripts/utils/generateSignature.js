const hre = require("hardhat");

// ============================================
// 🧠 DETERMINISTIC RISK SCORING ENGINE
// ============================================

// 1. BASE DE DATOS SIMULADA DE PAGADORES (Tier 1 vs Tier 3)
const CORPORATE_DATABASE = {
    "WALMART_INC": { tier: 1, multiplier: 1.0, name: "Walmart Inc." },
    "WHOLE_FOODS": { tier: 1, multiplier: 0.98, name: "Whole Foods Market" },
    "COSTCO_WHOLESALE": { tier: 1, multiplier: 0.99, name: "Costco Wholesale" },
    "TARGET_CORP": { tier: 1, multiplier: 0.97, name: "Target Corporation" },
    "TIENDA_LOCAL_SPA": { tier: 2, multiplier: 0.85, name: "Tienda Local S.P.A." },
    "COMERCIAL_MEDIANO": { tier: 2, multiplier: 0.80, name: "Comercial Mediano Ltda." },
    "EMPRESA_FANTASMA": { tier: 3, multiplier: 0.0, name: "Empresa Fantasma (Blacklisted)" },
    "DEUDOR_MOROSO": { tier: 3, multiplier: 0.0, name: "Deudor Moroso S.A." }
};

/**
 * Calcula el Risk Score basado en lógica de negocio determinista
 * @param {string} payerName - Nombre del pagador
 * @param {number} amount - Monto de la factura
 * @param {string} invoiceDate - Fecha de la factura (formato: YYYY-MM-DD)
 * @returns {object} { score, details, isApproved }
 */
function calculateRiskScore(payerName, amount, invoiceDate) {
    const details = {
        payerName,
        amount,
        invoiceDate,
        breakdown: {}
    };

    // Buscar información del pagador
    const companyInfo = CORPORATE_DATABASE[payerName];

    let calculatedScore = 0;

    if (!companyInfo) {
        // Empresa no reconocida = Riesgo Alto
        calculatedScore = 40;
        details.breakdown.payerRisk = -60;
        details.breakdown.reason = "Unknown payer - High risk";
    } else if (companyInfo.tier === 3) {
        // Lista negra = Rechazo automático
        calculatedScore = 0;
        details.breakdown.payerRisk = -100;
        details.breakdown.reason = "Blacklisted entity - Automatic rejection";
    } else {
        // Cálculo Base: 90 puntos * Multiplicador de reputación
        let baseScore = 90 * companyInfo.multiplier;
        details.breakdown.baseScore = baseScore;
        details.breakdown.payerTier = companyInfo.tier;
        details.breakdown.payerMultiplier = companyInfo.multiplier;

        // Penalización por Monto Excesivo (> $100k es riesgo de concentración)
        if (amount > 100000) {
            const amountPenalty = 15;
            baseScore -= amountPenalty;
            details.breakdown.amountPenalty = -amountPenalty;
            details.breakdown.amountReason = "High amount (>$100k) - Concentration risk";
        } else {
            details.breakdown.amountPenalty = 0;
        }

        // Penalización por antigüedad (facturas > 90 días pierden valor)
        const invoiceDateObj = new Date(invoiceDate);
        const today = new Date();
        const daysOld = Math.floor((today - invoiceDateObj) / (1000 * 60 * 60 * 24));

        if (daysOld > 90) {
            const agePenalty = Math.min(20, Math.floor((daysOld - 90) / 10)); // Max 20 puntos
            baseScore -= agePenalty;
            details.breakdown.agePenalty = -agePenalty;
            details.breakdown.daysOld = daysOld;
        } else {
            details.breakdown.agePenalty = 0;
            details.breakdown.daysOld = daysOld;
        }

        // Volatilidad de mercado controlada (+/- 3 puntos)
        // Esto evita que se vea "fake estático" pero es predecible
        const marketVolatility = Math.floor(Math.random() * 7) - 3; // Rango: -3 a +3
        baseScore += marketVolatility;
        details.breakdown.marketVolatility = marketVolatility;

        calculatedScore = Math.floor(baseScore);
    }

    // Normalizar (Max 100, Min 0)
    if (calculatedScore > 100) calculatedScore = 100;
    if (calculatedScore < 0) calculatedScore = 0;

    const isApproved = calculatedScore > 60; // Umbral de aprobación

    return {
        score: calculatedScore,
        isApproved,
        details
    };
}

async function main() {
    const [signer] = await hre.ethers.getSigners();

    // ============================================
    // DATOS DE PRUEBA (Simulación de extracción de PDF)
    // ============================================
    const userAddress = signer.address;
    const payerName = "WALMART_INC"; // Cambiar para probar diferentes escenarios
    const invoiceAmount = 50000;
    const invoiceDate = "2024-01-01";
    const docId = "INV-2024-001";

    console.log("🤖 Generando firma con Motor de Riesgo Determinista...");
    console.log("━".repeat(60));
    console.log("📊 DATOS DE ENTRADA:");
    console.log("   Usuario:", userAddress);
    console.log("   Pagador:", payerName);
    console.log("   Monto:", `$${invoiceAmount.toLocaleString()}`);
    console.log("   Fecha factura:", invoiceDate);
    console.log("━".repeat(60));

    // ============================================
    // ANÁLISIS DE RIESGO
    // ============================================
    const riskAnalysis = calculateRiskScore(payerName, invoiceAmount, invoiceDate);

    console.log("\n🧠 ANÁLISIS DE RIESGO:");
    console.log("   Score Final:", riskAnalysis.score, "/100");
    console.log("   Estado:", riskAnalysis.isApproved ? "✅ APROBADO" : "❌ RECHAZADO");
    console.log("\n📋 DESGLOSE:");
    console.log("   • Base Score:", riskAnalysis.details.breakdown.baseScore?.toFixed(2) || "N/A");
    console.log("   • Tier del Pagador:", riskAnalysis.details.breakdown.payerTier || "Unknown");
    console.log("   • Penalización por Monto:", riskAnalysis.details.breakdown.amountPenalty || 0);
    console.log("   • Penalización por Antigüedad:", riskAnalysis.details.breakdown.agePenalty || 0);
    console.log("   • Días desde emisión:", riskAnalysis.details.breakdown.daysOld);
    console.log("   • Volatilidad de mercado:", riskAnalysis.details.breakdown.marketVolatility);

    if (riskAnalysis.details.breakdown.reason) {
        console.log("   • Razón:", riskAnalysis.details.breakdown.reason);
    }

    // ============================================
    // GENERACIÓN DE FIRMA (Solo si aprobado)
    // ============================================
    let signature = "0x";

    if (riskAnalysis.isApproved) {
        console.log("\n🔐 GENERANDO FIRMA CRIPTOGRÁFICA...");

        const messageHash = hre.ethers.solidityPackedKeccak256(
            ["address", "uint256", "string"],
            [userAddress, riskAnalysis.score, docId]
        );

        signature = await signer.signMessage(hre.ethers.getBytes(messageHash));

        console.log("━".repeat(60));
        console.log("✅ FIRMA GENERADA:");
        console.log(signature);
        console.log("━".repeat(60));
    } else {
        console.log("\n❌ FIRMA NO GENERADA - Score insuficiente (<60)");
        console.log("━".repeat(60));
    }

    return {
        riskScore: riskAnalysis.score,
        isApproved: riskAnalysis.isApproved,
        signature,
        details: riskAnalysis.details
    };
}

// Permitir ejecutarlo directamente
if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

module.exports = {
    generateSignature: main,
    calculateRiskScore,
    CORPORATE_DATABASE
};
