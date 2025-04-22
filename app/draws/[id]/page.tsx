"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectButton } from "@mysten/dapp-kit";
import {
  Trophy,
  CheckCircle,
  ExternalLink,
  User,
  ArrowLeft,
  Gift,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDraw, getCurrentEpoch } from "@/contracts/get-object";
import { Draw } from "@/types/display";
import { Badge } from "@/components/ui/badge";
import { confirmDraw } from "@/contracts/confirm-draw";
import { luckyDraw } from "@/contracts/lucky-draw";
import { useBetterSignAndExecuteTransaction } from "@/hooks/useBetterTx";
import { useParams, useRouter } from "next/navigation";

export default function DrawDetailPage() {
  const params = useParams();
  const router = useRouter();
  const drawId = params.id as string;
  const [draw, setDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);

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
      try {
        setLoading(true);
        const drawData = await getDraw(drawId);
        const epoch = await getCurrentEpoch();

        if (drawData && drawData.publish) {
          setDraw(drawData);
        } else {
          // If draw doesn't exist or isn't published, redirect back to draws page
          router.push("/draws");
        }
        setCurrentEpoch(epoch);
      } catch (error) {
        console.error("Error fetching draw:", error);
        router.push("/draws");
      } finally {
        setLoading(false);
      }
    };

    if (drawId) {
      fetchData();
    }
  }, [drawId, router]);

  const handleConfirmDraw = async () => {
    if (!draw) return;

    await confirmDrawHandler({
      drawId: drawId,
    })
      .onSuccess(async () => {
        console.log("Confirm success");
        // Refresh the draw data
        const updatedDraw = await getDraw(drawId);
        if (updatedDraw) {
          setDraw(updatedDraw);
        }
      })
      .onError(async (error) => {
        console.log("Confirm error", error);
      })
      .execute();
  };

  const handleLuckyDraw = async () => {
    if (!draw) return;

    await luckyDrawHandler({
      drawId: drawId,
    })
      .onSuccess(async () => {
        console.log("Lucky draw success");
        // Refresh the draw data
        const updatedDraw = await getDraw(drawId);
        if (updatedDraw) {
          setDraw(updatedDraw);
        }
      })
      .onError(async (error) => {
        console.log("Lucky draw error", error);
      })
      .execute();
  };

  // Function to truncate address for display
  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-pink-500" />
              <span className="text-xl font-bold">LuckyDraw</span>
            </div>
            <div className="flex items-center gap-4">
              <ConnectButton />
            </div>
          </div>
        </header>

        <main className="container flex-1 py-10">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-pink-500" />
              <span className="text-xl font-bold">LuckyDraw</span>
            </div>
            <div className="flex items-center gap-4">
              <ConnectButton />
            </div>
          </div>
        </header>

        <main className="container flex-1 py-10">
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Draw not found</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              The draw you're looking for doesn't exist or isn't published.
            </p>
            <Link href="/draws">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Draws
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

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
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container flex-1 py-10">
        <div className="mb-6">
          <Link
            href="/draws"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to all draws
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Draw #{draw.id.id.substring(0, 6)}
            </h1>
            <p className="text-muted-foreground mt-1">ID: {draw.id.id}</p>
          </div>
          <Badge className="bg-green-500">Published</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column - Draw info */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Draw Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      End Epoch
                    </dt>
                    <dd className="text-lg font-medium">
                      {draw.end_at}
                      {currentEpoch > 0 && (
                        <span className="text-xs ml-2 text-muted-foreground">
                          {draw.end_at > currentEpoch
                            ? `(${draw.end_at - currentEpoch} epochs remaining)`
                            : "(Ended)"}
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Number of Winners
                    </dt>
                    <dd className="text-lg font-medium">{draw.num_winners}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Confirmations
                    </dt>
                    <dd className="text-lg font-medium">
                      {draw.confirm_by.length}/{draw.confirm_threshold}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Items
                    </dt>
                    <dd className="text-lg font-medium">{draw.items.length}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confirmations</CardTitle>
              </CardHeader>
              <CardContent>
                {draw.confirm_by.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No confirmations yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {draw.confirm_by.map((address, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">
                          {truncateAddress(address)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {draw.lucky.length === 0 && (
              <div className="space-y-3">
                {draw.confirm_by.length < draw.confirm_threshold && (
                  <Button className="w-full" onClick={handleConfirmDraw}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm Draw
                  </Button>
                )}

                {draw.confirm_by.length >= draw.confirm_threshold &&
                  draw.end_at < currentEpoch && (
                    <Button
                      className="w-full bg-pink-600 hover:bg-pink-700"
                      onClick={handleLuckyDraw}
                    >
                      <Gift className="mr-2 h-4 w-4" />
                      Draw Lottery
                    </Button>
                  )}
              </div>
            )}

            {draw.lucky.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Lucky Winners</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{draw.lucky.join(", ")}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - Items */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Items ({draw.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {draw.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No items available
                    </p>
                  ) : (
                    draw.items.map((item, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.desc}
                        </p>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 flex items-center mt-2 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {item.url}
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
