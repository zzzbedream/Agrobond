const { calculateRiskScore, CORPORATE_DATABASE } = require('./generateSignature');

console.log("🧪 PRUEBA DEL MOTOR DE RIESGO DETERMINISTA");
console.log("=".repeat(80));

// Escenario 1: Empresa Tier 1, monto normal, factura reciente
console.log("\n📊 ESCENARIO 1: Cliente Premium + Factura Reciente");
const test1 = calculateRiskScore("WALMART_INC", 50000, "2025-12-01");
console.log(`   Resultado: ${test1.score}/100 - ${test1.isApproved ? '✅ APROBADO' : '❌ RECHAZADO'}`);
console.log(`   Razón: Tier ${test1.details.breakdown.payerTier}, Sin penalizaciones mayores`);

// Escenario 2: Empresa Tier 1, monto ALTO
console.log("\n📊 ESCENARIO 2: Cliente Premium + Monto Alto ($150k)");
const test2 = calculateRiskScore("COSTCO_WHOLESALE", 150000, "2025-12-01");
console.log(`   Resultado: ${test2.score}/100 - ${test2.isApproved ? '✅ APROBADO' : '❌ RECHAZADO'}`);
console.log(`   Penalización por monto: ${test2.details.breakdown.amountPenalty} puntos`);

// Escenario 3: Empresa Tier 2 (riesgo medio)
console.log("\n📊 ESCENARIO 3: Cliente Mediano (Tier 2)");
const test3 = calculateRiskScore("TIENDA_LOCAL_SPA", 30000, "2025-11-01");
console.log(`   Resultado: ${test3.score}/100 - ${test3.isApproved ? '✅ APROBADO' : '❌ RECHAZADO'}`);
console.log(`   Multiplicador: ${test3.details.breakdown.payerMultiplier}x`);

// Escenario 4: Empresa en lista negra
console.log("\n📊 ESCENARIO 4: Empresa en Lista Negra (Blacklist)");
const test4 = calculateRiskScore("EMPRESA_FANTASMA", 10000, "2025-12-01");
console.log(`   Resultado: ${test4.score}/100 - ${test4.isApproved ? '✅ APROBADO' : '❌ RECHAZADO'}`);
console.log(`   Razón: ${test4.details.breakdown.reason}`);

// Escenario 5: Empresa desconocida
console.log("\n📊 ESCENARIO 5: Empresa No Reconocida");
const test5 = calculateRiskScore("EMPRESA_RANDOM_XYZ", 25000, "2025-12-01");
console.log(`   Resultado: ${test5.score}/100 - ${test5.isApproved ? '✅ APROBADO' : '❌ RECHAZADO'}`);
console.log(`   Razón: ${test5.details.breakdown.reason}`);

// Escenario 6: Factura muy antigua
console.log("\n📊 ESCENARIO 6: Factura Antigua (>180 días)");
const test6 = calculateRiskScore("TARGET_CORP", 40000, "2024-01-01");
console.log(`   Resultado: ${test6.score}/100 - ${test6.isApproved ? '✅ APROBADO' : '❌ RECHAZADO'}`);
console.log(`   Días desde emisión: ${test6.details.breakdown.daysOld}`);
console.log(`   Penalización por antigüedad: ${test6.details.breakdown.agePenalty} puntos`);

console.log("\n" + "=".repeat(80));
console.log("📋 BASE DE DATOS DE PAGADORES:");
console.log("=".repeat(80));
Object.entries(CORPORATE_DATABASE).forEach(([key, value]) => {
    console.log(`   ${key.padEnd(25)} | Tier ${value.tier} | Multiplier: ${value.multiplier}x`);
});

console.log("\n✅ Pruebas completadas");
