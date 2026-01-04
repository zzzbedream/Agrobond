"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, usePublicClient } from "wagmi";
import { formatEther } from "viem";
import { CONTRACT_ADDRESSES, AGRO_BOND_ABI, BOND_TOKEN_IDS, ERC20_ABI, LIQUIDITY_POOL_ABI, ORACLE_ABI } from "../utils/agroBondConstants";
import { useBlockchainOperations } from "../hooks/useBlockchainOperations";
import TransactionStatus from "./TransactionStatus";
import { TrendingUp, Users, DollarSign, Activity, Shield, Droplet } from "lucide-react";

type AIResult = {
    success: boolean;
    payer: string;
    riskScore: number;
    isApproved: boolean;
    signature: string;
    docId: string;
    reason: string;
};

type UserRole = 'customer' | 'admin';

const DEMO_SCENARIOS = [
    { id: "WALMART_INC", name: "Walmart Inc.", emoji: "✅", description: "Cliente AAA - Riesgo Bajo" },
    { id: "TIENDA_LOCAL_SPA", name: "Tienda Local", emoji: "⚠️", description: "Cliente Tier 2 - Riesgo Medio" },
    { id: "EMPRESA_FANTASMA", name: "Empresa Fantasma", emoji: "❌", description: "Lista Negra - Alto Riesgo" }
];

export default function Dashboard() {
    const { address, isConnected } = useAccount();
    const { mintBond, sellBond, txState, reset } = useBlockchainOperations();
    const publicClient = usePublicClient();

    // Role management
    const [userRole, setUserRole] = useState<UserRole>('customer');

    // Customer state
    const [loading, setLoading] = useState(false);
    const [scenario, setScenario] = useState("WALMART_INC");
    const [aiResult, setAiResult] = useState<AIResult | null>(null);

    // Read customer bond balance
    const { data: bondBalance, refetch } = useReadContract({
        address: CONTRACT_ADDRESSES.AGRO_BOND,
        abi: AGRO_BOND_ABI,
        functionName: "balanceOf",
        args: address ? [address, BOND_TOKEN_IDS.SENIOR] : undefined,
        query: { enabled: !!address, refetchInterval: 5000 }
    });

    // Read pool liquidity (admin view)
    const { data: poolLiquidity } = useReadContract({
        address: CONTRACT_ADDRESSES.CASH_TOKEN,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [CONTRACT_ADDRESSES.LIQUIDITY_POOL],
        query: { enabled: userRole === 'admin', refetchInterval: 5000 }
    });

    useEffect(() => {
        if (txState.status === 'success' && txState.hash) {
            const timer = setTimeout(() => refetch(), 3000);
            return () => clearTimeout(timer);
        }
    }, [txState.status, txState.hash, refetch]);

    const runAnalysis = async () => {
        if (!isConnected) {
            alert("⚠️ Por favor conecta tu wallet primero");
            return;
        }

        setLoading(true);
        setAiResult(null);
        reset();

        try {
            // SECURITY FIX: Fetch current nonce from oracle contract
            if (!publicClient || !address) {
                throw new Error("Wallet not connected");
            }

            const currentNonce = await publicClient.readContract({
                address: CONTRACT_ADDRESSES.ORACLE,
                abi: ORACLE_ABI,
                functionName: 'getNonce',
                args: [address]
            });

            console.log("🔢 Current nonce for user:", currentNonce);

            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userAddress: address,
                    nonce: Number(currentNonce), // Include nonce for signature
                    extractedData: { payerName: scenario, amount: 50000, date: "2024-01-01" }
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            const data = await res.json();
            if (typeof data.riskScore !== 'number' || !data.signature) {
                throw new Error("Respuesta inválida del servidor");
            }

            setAiResult(data);
            console.log("📊 Análisis completado:", data);
        } catch (e: any) {
            console.error("❌ Error en análisis:", e);
            alert(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleMint = async () => {
        if (!aiResult?.isApproved) {
            alert("⚠️ Este escenario no fue aprobado");
            return;
        }

        const result = await mintBond(50000, aiResult.riskScore, aiResult.docId, aiResult.signature);
        if (result.success) console.log("✅ Bond minteado:", result.hash);
    };

    const handleSell = async () => {
        if (!bondBalance || bondBalance === 0n) {
            alert("⚠️ No tienes bonos para vender");
            return;
        }

        const result = await sellBond(bondBalance as bigint);
        if (result.success) console.log("✅ Bond vendido:", result.hash);
    };

    // ============ ADMIN VIEW ============
    if (userRole === 'admin') {
        return (
            <div className="min-h-screen bg-black text-white">
                {/* Admin Navbar */}
                <div className="border-b border-white/5 bg-black/50 backdrop-blur-2xl">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Shield className="w-5 h-5 text-emerald-400" />
                                <span className="font-light">Admin Dashboard</span>
                            </div>
                            <button
                                onClick={() => setUserRole('customer')}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-light transition-all"
                            >
                                Switch to Customer View
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-12">
                    {/* Admin Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Total Liquidity */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                    <Droplet className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-sm text-slate-400 font-light">Pool Liquidity</span>
                            </div>
                            <div className="text-3xl font-extralight mb-2">
                                {poolLiquidity ? formatEther(poolLiquidity as bigint) : "0"}
                            </div>
                            <div className="text-sm text-slate-500 font-light">mETH</div>
                        </div>

                        {/* Total Bonds Issued */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-sm text-slate-400 font-light">Bonds Issued</span>
                            </div>
                            <div className="text-3xl font-extralight mb-2">124</div>
                            <div className="text-sm text-slate-500 font-light">Total count</div>
                        </div>

                        {/* Active Users */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-sm text-slate-400 font-light">Active Users</span>
                            </div>
                            <div className="text-3xl font-extralight mb-2">47</div>
                            <div className="text-sm text-slate-500 font-light">Last 30 days</div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-5 h-5 text-slate-400" />
                            <h3 className="text-lg font-light">Recent Activity</h3>
                        </div>

                        <div className="space-y-3">
                            {[
                                { action: "Bond Minted", user: "0x1aF8...Ba76", amount: "50,000", time: "2 min ago", status: "success" },
                                { action: "Bond Sold", user: "0x742d...35Ad", amount: "30,000", time: "5 min ago", status: "success" },
                                { action: "Risk Analysis", user: "0x9C5f...8E2c", amount: "—", time: "8 min ago", status: "rejected" },
                            ].map((activity, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                                        <div>
                                            <div className="text-sm font-light">{activity.action}</div>
                                            <div className="text-xs text-slate-500">{activity.user}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-light">{activity.amount}</div>
                                        <div className="text-xs text-slate-500">{activity.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Protocol Settings */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-light mb-6">Protocol Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="text-sm text-slate-400 mb-2">Risk Threshold</div>
                                <div className="text-2xl font-extralight">60/100</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-400 mb-2">Pool Discount Rate</div>
                                <div className="text-2xl font-extralight">5%</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-400 mb-2">Senior/Junior Split</div>
                                <div className="text-2xl font-extralight">80/20</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-400 mb-2">Oracle Address</div>
                                <div className="text-xs font-mono text-slate-500">{CONTRACT_ADDRESSES.AGRO_BOND.slice(0, 10)}...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============ CUSTOMER VIEW ============
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Customer Navbar */}
            <div className="border-b border-white/5 bg-black/50 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-light">Operations Panel</h2>
                        <button
                            onClick={() => setUserRole('admin')}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-light transition-all"
                        >
                            Switch to Admin View
                        </button>
                    </div>
                </div>
            </div>

            {!isConnected && (
                <div className="max-w-7xl mx-auto px-6 mt-6">
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm font-light">⚠️ Por favor conecta tu wallet para continuar</p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Risk Analysis Column */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h3 className="text-xl font-light mb-6">AI Risk Analysis</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm text-slate-400 font-light mb-2 block">Select Scenario</label>
                                <select
                                    value={scenario}
                                    onChange={(e) => { setScenario(e.target.value); setAiResult(null); reset(); }}
                                    disabled={!isConnected || loading}
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-emerald-500/50 transition-all disabled:opacity-30 font-light"
                                >
                                    {DEMO_SCENARIOS.map((s) => (
                                        <option key={s.id} value={s.id} className="bg-black">
                                            {s.emoji} {s.name} - {s.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={runAnalysis}
                                disabled={loading || !isConnected}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg font-light transition-all disabled:opacity-30"
                            >
                                {loading ? "Analyzing..." : "Run Risk Engine"}
                            </button>
                        </div>

                        {aiResult && (
                            <div className={`mt-6 p-6 rounded-xl border ${aiResult.isApproved ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-slate-400 font-light text-sm">Risk Score</span>
                                    <span className={`text-4xl font-extralight ${aiResult.isApproved ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {aiResult.riskScore}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 font-light">{aiResult.reason}</p>
                                {aiResult.isApproved && (
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <span className="text-xs text-emerald-400/70 font-mono">✓ Signature generated</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Liquidity Management Column */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h3 className="text-xl font-light mb-6">Liquidity Management</h3>

                        <div className="space-y-6">
                            <button
                                onClick={handleMint}
                                disabled={!aiResult?.isApproved || !isConnected || txState.status === 'pending'}
                                className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg font-light transition-all disabled:opacity-30"
                            >
                                {txState.status === 'pending' ? "Processing..." : "Issue Bond (ERC-1155)"}
                            </button>

                            <div className="h-px bg-white/5"></div>

                            <div className="p-4 bg-white/[0.02] rounded-lg border border-white/5">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400 font-light">Your Senior Bonds</span>
                                    <span className="text-2xl font-extralight">{bondBalance ? bondBalance.toString() : "0"}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSell}
                                disabled={!bondBalance || bondBalance === 0n || !isConnected || txState.status === 'pending'}
                                className="w-full py-3 bg-white text-black hover:bg-slate-100 rounded-lg font-light transition-all disabled:opacity-30"
                            >
                                Sell for Cash (Swap)
                            </button>

                            <p className="text-xs text-center text-slate-500 font-light">
                                Pool: 500k mETH | 5% discount
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <TransactionStatus txHash={txState.hash} />
        </div>
    );
}
