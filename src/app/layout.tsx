import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {ReactNode} from "react";
import CustomProvider from "@/providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Luckcky Sui",
    description: "Decentralized lottery platform",
    icons: `${process.env.NEXT_PUBLIC_AGGREGATOR}/6HIiafiT96w3qe3gjWPVULxfhPWnMYodfrxpMnQCU3E`
};

export default function RootLayout({children}: Readonly<{children: ReactNode}>) {
    return (
        <html lang="en">
            <CustomProvider>
                <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                    {children}
                </body>
            </CustomProvider>
        </html>
    );
}
