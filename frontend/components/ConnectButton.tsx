'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function ConnectButton() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-3">
                <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-emerald-500/30">
                    <p className="text-xs text-slate-400">Conectado</p>
                    <p className="text-sm font-mono text-white">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                </div>
                <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                >
                    Desconectar
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => {
                const connector = connectors[0]; // MetaMask injected
                if (connector) {
                    connect({ connector });
                }
            }}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all"
        >
            Conectar Wallet
        </button>
    );
}
