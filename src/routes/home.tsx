import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { isAdmin } from "@/actions/isAdmin";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/hero-section";
export function Home() {
  const currentAccount = useCurrentAccount();
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (currentAccount?.address) {
        const result = await isAdmin(currentAccount.address);
        setIsAdminUser(result);
      }
    };
    checkAdmin();
  }, [currentAccount]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* <nav className="bg-white dark:bg-gray-950 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold text-indigo-600 dark:text-indigo-400"
            >
              <Trophy className="w-6 h-6" />
              <span>Lucky</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
              >
                <HomeIcon className="w-4 h-4" />
                <span className="text-sm font-medium">首页</span>
              </Link>
              {isAdminUser && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
                >
                  <LockClosedIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">管理员</span>
                </Link>
              )}
              <div className="connect-wallet-wrapper">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </nav> */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold">LuckyDraw</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              to="/draws"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              All Draws
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {/* <Link href="/connect">
              <Button variant="outline">Connect Wallet</Button>
            </Link> */}
            {/* 如果当前账户是 admin，则显示 Admin Panel */}
            {isAdminUser && (
              <Link
                to="/admin"
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
        {/* <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/board/:id" element={<BoardDetail />} />
        </Routes> */}

        <HeroSection />
      </main>
    </div>
  );
}
