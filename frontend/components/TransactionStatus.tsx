import { type Hash } from 'viem';
import { MANTLE_NETWORK } from '../utils/agroBondConstants';

interface TransactionStatusProps {
    txHash: Hash | null;
}

export default function TransactionStatus({ txHash }: TransactionStatusProps) {
    if (!txHash) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in-up">
            <div className="bg-white rounded-lg shadow-2xl border border-emerald-200 p-4 max-w-sm">
                <div className="flex items-start gap-3">
                    <div className="text-emerald-500 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Transacción Enviada ✅</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Tu transacción está siendo procesada en Mantle.
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                {txHash.slice(0, 10)}...{txHash.slice(-8)}
                            </code>
                            <a
                                href={`${MANTLE_NETWORK.explorerUrl}/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                            >
                                Ver
                                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
