"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Trophy, CheckCircle, Gift } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllDraws, getCurrentEpoch } from "@/contracts/get-object";
import { Draw } from "@/types/display";
import { Badge } from "@/components/ui/badge";
import { confirmDraw } from "@/contracts/confirm-draw";
import { luckyDraw } from "@/contracts/lucky-draw";
import { useBetterSignAndExecuteTransaction } from "@/hooks/useBetterTx";
import { truncateAddress } from "@/utils";
import { isAdmin } from "@/contracts/is-admin";

export default function DrawsPage() {
  const account = useCurrentAccount();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
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

  const { handleSignAndExecuteTransaction: confirmDrawHandler } =
    useBetterSignAndExecuteTransaction({
      tx: confirmDraw,
    });

  const { handleSignAndExecuteTransaction: luckyDrawHandler } =
    useBetterSignAndExecuteTransaction({
      tx: luckyDraw,
    });

  useEffect(() => {
    const fetchData = async () => {
      const allDraws = await getAllDraws();
      const epoch = await getCurrentEpoch();

      // Filter to only show published draws
      const publishedDraws = allDraws.filter((draw) => draw.publish);
      if (publishedDraws.length > 0) {
        setDraws(publishedDraws);
      }
      setCurrentEpoch(epoch);
    };
    fetchData();
  }, []);

  const handleConfirmDraw = async (drawId: string) => {
    await confirmDrawHandler({
      drawId: drawId,
    })
      .onSuccess(async () => {
        console.log("Confirm success");
        // Refresh the draws list after successful confirmation
        const allDraws = await getAllDraws();
        const publishedDraws = allDraws.filter((draw) => draw.publish);
        setDraws(publishedDraws);
      })
      .onError(async (error) => {
        console.log("Confirm error", error);
      })
      .execute();
  };

  const handleLuckyDraw = async (drawId: string) => {
    await luckyDrawHandler({
      drawId: drawId,
    })
      .onSuccess(async () => {
        console.log("Lucky draw success");
        // Refresh the draws list after successful draw
        const allDraws = await getAllDraws();
        const publishedDraws = allDraws.filter((draw) => draw.publish);
        setDraws(publishedDraws);
      })
      .onError(async (error) => {
        console.log("Lucky draw error", error);
      })
      .execute();
  };

  return (
    <div className="flex min-h-screen flex-col">
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

      <main className="container flex-1 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Lucky Draws</h1>
        </div>

        {draws.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-md border-dashed">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">
              No published draws available
            </h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Check back later for new lucky draw opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {draws.map((draw) => (
              <Card key={draw.id.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="flex justify-between items-center">
                    <span>{truncateAddress(draw.id.id)}</span>
                    <Badge className="bg-green-500">Published</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Items
                        </p>
                        <p className="text-lg font-medium">
                          {draw.items.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Winners
                        </p>
                        <p className="text-lg font-medium">
                          {draw.num_winners}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Confirmations
                        </p>
                        <p className="text-lg font-medium">
                          {draw.confirm_by.length}/{draw.confirm_threshold}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          End Epoch
                        </p>
                        <p className="text-lg font-medium">
                          {draw.end_at}
                          {currentEpoch > 0 && (
                            <span className="text-xs ml-2 text-muted-foreground">
                              {draw.end_at > currentEpoch
                                ? `(${
                                    draw.end_at - currentEpoch
                                  } epochs remaining)`
                                : "(Ended)"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Preview of items */}
                    <div className="border-t pt-4">
                      <h3 className="text-base font-medium mb-2">
                        Items Preview
                      </h3>
                      <div className="space-y-2">
                        {draw.items.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No items available
                          </p>
                        ) : (
                          <>
                            {draw.items.slice(0, 3).map((item, index) => (
                              <div
                                key={index}
                                className="border rounded-md p-3"
                              >
                                <h4 className="font-medium text-sm">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {item.desc}
                                </p>
                              </div>
                            ))}
                            {draw.items.length > 3 && (
                              <p className="text-sm text-muted-foreground mt-2">
                                +{draw.items.length - 3} more items
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href={`/draws/${draw.id.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>

                      {draw.lucky.length === 0 &&
                        draw.confirm_by.length < draw.confirm_threshold && (
                          <Button
                            className="flex-1"
                            onClick={() => handleConfirmDraw(draw.id.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm Draw
                          </Button>
                        )}

                      {draw.lucky.length === 0 &&
                        draw.confirm_by.length >= draw.confirm_threshold &&
                        draw.end_at < currentEpoch && (
                          <Button
                            className="flex-1 bg-pink-600 hover:bg-pink-700"
                            onClick={() => handleLuckyDraw(draw.id.id)}
                          >
                            <Gift className="mr-2 h-4 w-4" />
                            Draw Lottery
                          </Button>
                        )}
                    </div>

                    {draw.lucky.length > 0 && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Lucky Winners
                        </p>
                        <p className="text-sm">{draw.lucky.join(", ")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
