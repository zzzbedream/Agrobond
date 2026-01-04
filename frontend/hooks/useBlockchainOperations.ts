import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { parseEther, isHex, type Hash } from 'viem';
import { AGRO_BOND_ABI, LIQUIDITY_POOL_ABI, CONTRACT_ADDRESSES } from '../utils/agroBondConstants';

type TxState = {
    hash: Hash | null;
    status: 'idle' | 'pending' | 'success' | 'error';
    message?: string;
};

export const useBlockchainOperations = () => {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();

    const [txState, setTxState] = useState<TxState>({
        hash: null,
        status: 'idle'
    });

    // VALIDAR FIRMA
    const validateSignature = (signature: string): signature is `0x${string}` => {
        if (!isHex(signature)) {
            throw new Error("La firma debe ser hexadecimal");
        }
        if (signature.length !== 132) { // 0x + 130 caracteres (65 bytes)
            throw new Error(`Firma inválida: longitud ${signature.length}, esperada 132`);
        }
        return true;
    };

    // 1. FUNCIÓN DE MINT - CORREGIDA
    const mintBond = useCallback(async (
        invoiceAmount: number,
        riskScore: number,
        docId: string,
        signature: string
    ) => {
        try {
            if (!address) {
                throw new Error("Wallet no conectada");
            }

            // Validar firma
            validateSignature(signature);

            setTxState({ hash: null, status: 'pending', message: 'Confirmando en Wallet...' });

            // Convertir valores correctamente
            const amount = BigInt(invoiceAmount);
            const score = BigInt(riskScore);
            const sig = signature as `0x${string}`;

            console.log("📝 Minting bond:", { amount: amount.toString(), score: score.toString(), docId });

            const hash = await writeContractAsync({
                address: CONTRACT_ADDRESSES.AGRO_BOND,
                abi: AGRO_BOND_ABI,
                functionName: 'mintBond',
                args: [amount, score, docId, sig],
            });

            setTxState({ hash, status: 'success', message: 'Transacción Enviada' });

            // Esperar confirmación
            if (publicClient) {
                const receipt = await publicClient.waitForTransactionReceipt({ hash });
                if (receipt.status === 'reverted') {
                    throw new Error("Transacción revertida");
                }
                console.log("✅ Transacción confirmada:", receipt.transactionHash);
            }

            return { success: true, hash };

        } catch (error: any) {
            console.error("❌ Error en mintBond:", error);
            const errorMessage = error?.shortMessage || error?.message || 'Error al mintear';
            setTxState({ hash: null, status: 'error', message: errorMessage });
            return { success: false, error: errorMessage };
        }
    }, [address, writeContractAsync, publicClient]);

    // 2. FUNCIÓN DE VENTA - CORREGIDA
    const sellBond = useCallback(async (amount: bigint) => {
        try {
            if (!address) {
                throw new Error("Wallet no conectada");
            }

            if (amount <= 0n) {
                throw new Error("Cantidad inválida");
            }

            setTxState({ hash: null, status: 'pending', message: 'Aprobando venta...' });

            // Primero: Aprobar
            await writeContractAsync({
                address: CONTRACT_ADDRESSES.AGRO_BOND,
                abi: AGRO_BOND_ABI,
                functionName: 'setApprovalForAll',
                args: [CONTRACT_ADDRESSES.LIQUIDITY_POOL, true],
            });

            setTxState({ hash: null, status: 'pending', message: 'Ejecutando venta...' });

            // Segundo: Vender
            const hash = await writeContractAsync({
                address: CONTRACT_ADDRESSES.LIQUIDITY_POOL,
                abi: LIQUIDITY_POOL_ABI,
                functionName: 'sellSeniorBond',
                args: [amount],
            });

            setTxState({ hash, status: 'success', message: 'Venta Completada' });

            // Esperar confirmación
            if (publicClient) {
                const receipt = await publicClient.waitForTransactionReceipt({ hash });
                if (receipt.status === 'reverted') {
                    throw new Error("Transacción revertida");
                }
            }

            return { success: true, hash };

        } catch (error: any) {
            console.error("❌ Error en sellBond:", error);
            const errorMessage = error?.shortMessage || error?.message || 'Error al vender';
            setTxState({ hash: null, status: 'error', message: errorMessage });
            return { success: false, error: errorMessage };
        }
    }, [address, writeContractAsync, publicClient]);

    const reset = useCallback(() => {
        setTxState({ hash: null, status: 'idle' });
    }, []);

    return {
        mintBond,
        sellBond,
        txState,
        setTxState,
        reset
    };
};
