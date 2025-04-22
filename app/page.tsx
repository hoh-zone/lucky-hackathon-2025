"use client";

import Link from "next/link";
import { ConnectButton } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import HeroSection from "@/components/hero-section";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/contracts/is-admin";
import { Foot } from "@/components/footer";

export default function Home() {
  const account = useCurrentAccount();
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (account?.address) {
        const result = await isAdmin(account.address);
        setIsAdminUser(result);
      }
    };
    checkAdmin();
  }, [account]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold">LuckyDraw</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/draws"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              All Draws
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {/* 如果当前账户是 admin，则显示 Admin Panel */}
            {isAdminUser && (
              <Link
                href="/admin"
                className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
              >
                <Button variant="outline">Admin Panel</Button>
              </Link>
            )}

            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <HeroSection />
      </main>
    </div>
  );
}
