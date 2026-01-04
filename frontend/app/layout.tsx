import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "../components/Web3Provider";

export const metadata: Metadata = {
    title: "AgroBond | Instant Liquidity for Agriculture",
    description: "Transform agricultural invoices into liquid assets with AI-powered risk assessment on Mantle Network",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Web3Provider>
                    {children}
                </Web3Provider>
            </body>
        </html>
    );
}
