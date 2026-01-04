"use client";

import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import Dashboard from "../components/Dashboard";

export default function HomePage() {
    const [view, setView] = useState<'landing' | 'app'>('landing');
    const { isConnected } = useAccount();
    const { connect, connectors } = useConnect();

    // Handle launch app - connect wallet if not connected, or go to app
    const handleLaunchApp = () => {
        if (!isConnected) {
            const injectedConnector = connectors.find(c => c.id === 'injected');
            if (injectedConnector) {
                connect({ connector: injectedConnector });
            }
        } else {
            setView('app');
        }
    };

    if (view === 'app') {
        return (
            <div className="min-h-screen">
                <div className="border-b border-slate-800/50 bg-black/50 backdrop-blur-2xl">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <button
                            onClick={() => setView('landing')}
                            className="group flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-all duration-300"
                        >
                            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="text-sm font-light">Back</span>
                        </button>
                    </div>
                </div>
                <Dashboard />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 border-b border-white/5 bg-black/30 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                                <div className="relative w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <span className="text-lg">🌾</span>
                                </div>
                            </div>
                            <span className="text-lg font-light tracking-wider">AgroBond</span>
                        </div>

                        <div className="flex items-center gap-8">
                            <a href="#features" className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors font-light">
                                Features
                            </a>
                            <a href="#how" className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors font-light">
                                How it works
                            </a>
                            <button
                                onClick={handleLaunchApp}
                                className="group relative px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-lg text-sm font-light transition-all duration-300"
                            >
                                <span className="relative z-10">Launch App</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-500"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-32 lg:pt-48 lg:pb-48">
                    <div className="max-w-5xl">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-12 backdrop-blur-xl">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-slate-400 font-light tracking-wide uppercase">Powered by Mantle Network</span>
                        </div>

                        {/* Main headline */}
                        <h1 className="text-6xl lg:text-8xl font-extralight leading-[1.1] mb-8 tracking-tight">
                            Instant liquidity
                            <br />
                            <span className="relative inline-block mt-2">
                                <span className="relative z-10 bg-gradient-to-r from-emerald-200 via-emerald-300 to-green-200 bg-clip-text text-transparent">
                                    for agriculture
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-green-500/30 blur-2xl"></div>
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl lg:text-2xl text-slate-400 font-light leading-relaxed mb-12 max-w-3xl">
                            Transform agricultural invoices into liquid assets in seconds.
                            <br className="hidden lg:block" />
                            AI-powered risk assessment. Zero friction.
                        </p>

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleLaunchApp}
                                className="group relative px-8 py-4 bg-white text-black rounded-lg font-light overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Get started
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </button>

                            <a
                                href="#features"
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-light transition-all duration-300 text-center"
                            >
                                Learn more
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 mt-24 pt-12 border-t border-white/5">
                            <div>
                                <div className="text-3xl lg:text-4xl font-extralight text-white mb-1">$5M+</div>
                                <div className="text-sm text-slate-500 font-light">Tokenized</div>
                            </div>
                            <div>
                                <div className="text-3xl lg:text-4xl font-extralight text-white mb-1">&lt;2s</div>
                                <div className="text-sm text-slate-500 font-light">Approval time</div>
                            </div>
                            <div>
                                <div className="text-3xl lg:text-4xl font-extralight text-white mb-1">99.98%</div>
                                <div className="text-sm text-slate-500 font-light">Gas savings</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="relative border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-32 lg:py-48">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-32">
                        <div className="space-y-16">
                            {/* Feature 1 */}
                            <div className="group">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-px h-12 bg-gradient-to-b from-emerald-500/50 to-transparent"></div>
                                    <div>
                                        <h3 className="text-2xl lg:text-3xl font-extralight mb-4">AI-powered risk assessment</h3>
                                        <p className="text-slate-400 font-light leading-relaxed">
                                            Deterministic scoring engine evaluates creditworthiness, invoice age, and amount concentration in milliseconds. Fully transparent and auditable.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="group">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-px h-12 bg-gradient-to-b from-blue-500/50 to-transparent"></div>
                                    <div>
                                        <h3 className="text-2xl lg:text-3xl font-extralight mb-4">Instant liquidity</h3>
                                        <p className="text-slate-400 font-light leading-relaxed">
                                            Pre-funded liquidity pool with 500k mETH. Sell your senior bonds instantly with a fixed 5% discount. No orderbooks, no delays.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="group">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-px h-12 bg-gradient-to-b from-purple-500/50 to-transparent"></div>
                                    <div>
                                        <h3 className="text-2xl lg:text-3xl font-extralight mb-4">Built on Mantle</h3>
                                        <p className="text-slate-400 font-light leading-relaxed">
                                            ~$0.002 per transaction vs $15 on Ethereum L1. Fast confirmations. Battle-tested security. ERC-1155 standard for maximum compatibility.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual element */}
                        <div className="relative hidden lg:block">
                            <div className="sticky top-32">
                                <div className="relative aspect-square">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl backdrop-blur-3xl border border-white/5"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center space-y-6">
                                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                                <span className="text-xs text-emerald-400 font-light">Live on Mantle Sepolia</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-sm text-slate-500 font-light">Total Value Locked</div>
                                                <div className="text-5xl font-extralight">500k</div>
                                                <div className="text-slate-500 font-light">mETH</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how" className="relative border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-32 lg:py-48">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl lg:text-6xl font-extralight mb-6">Simple, powerful workflow</h2>
                        <p className="text-xl text-slate-400 font-light">From invoice to liquidity in three steps</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Step 1 */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-emerald-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative bg-black/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 h-full">
                                <div className="text-6xl font-extralight text-slate-800 mb-6">01</div>
                                <h3 className="text-xl font-light mb-4">Risk analysis</h3>
                                <p className="text-slate-400 font-light leading-relaxed">
                                    Upload invoice. AI analyzes payer reputation, amount, and age. Get instant approval or rejection with full transparency.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-blue-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative bg-black/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 h-full">
                                <div className="text-6xl font-extralight text-slate-800 mb-6">02</div>
                                <h3 className="text-xl font-light mb-4">Tokenization</h3>
                                <p className="text-slate-400 font-light leading-relaxed">
                                    Mint ERC-1155 bonds backed by your invoice. 80% senior (lower risk), 20% junior (higher yield). Fully on-chain.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative bg-black/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 h-full">
                                <div className="text-6xl font-extralight text-slate-800 mb-6">03</div>
                                <h3 className="text-xl font-light mb-4">Instant cash</h3>
                                <p className="text-slate-400 font-light leading-relaxed">
                                    Sell senior bonds to liquidity pool. Receive mETH instantly at 95% of face value. No waiting, no friction.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                                <span className="text-sm">🌾</span>
                            </div>
                            <span className="font-light tracking-wider">AgroBond</span>
                        </div>

                        <div className="flex flex-wrap gap-8 text-sm text-slate-500 font-light">
                            <a href="https://docs.mantle.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Docs</a>
                            <a href="https://explorer.sepolia.mantle.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Explorer</a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
                        </div>

                        <div className="text-sm text-slate-600 font-light">
                            © 2026 Hackathon Project
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
