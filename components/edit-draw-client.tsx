"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Trophy } from "lucide-react";
import { ConnectButton } from "@mysten/dapp-kit";
import { Draw, ItemInfo } from "@/types/display";
import { useEffect, useState } from "react";
import { getDraw } from "@/contracts/get-object";
import AddItemModal from "@/components/add-item-modal";
import ItemsList from "@/components/items-list";
import { useBetterSignAndExecuteTransaction } from "@/hooks/useBetterTx";
import { addItem } from "@/contracts/add-item";
import { removeItem } from "@/contracts/remove-item";

interface EditDrawClientProps {
  drawId: string;
}

export default function EditDrawClient({ drawId }: EditDrawClientProps) {
  const [draw, setDraw] = useState<Draw>();
  const { handleSignAndExecuteTransaction: addItemHandler } =
    useBetterSignAndExecuteTransaction({
      tx: addItem,
    });
  const { handleSignAndExecuteTransaction: removeItemHandler } =
    useBetterSignAndExecuteTransaction({
      tx: removeItem,
    });

  const handleAddItem = async (item: ItemInfo) => {
    // setDraw((prevDraw) => {
    //   if (!prevDraw) return prevDraw;
    //   return {
    //     ...prevDraw,
    //     items: [...prevDraw.items, item],
    //   };
    // });
    addItemHandler({
      drawId: drawId,
      name: item.name,
      desc: item.desc,
      url: item.url,
    })
      .onSuccess(async () => {
        console.log("onSuccess");
        await fetchDraw();
      })
      .onError(async (error) => {
        console.log("onError", error);
      })
      .execute();
  };

  const handleRemoveItem = async (index: number) => {
    // const newItems = [...(draw?.items || [])];
    // newItems.splice(index, 1);
    // setDraw((prevDraw) => {
    //   if (!prevDraw) return prevDraw;
    //   return {
    //     ...prevDraw,
    //     items: newItems,
    //   };
    // });

    removeItemHandler({
      drawId: drawId,
      index: index,
    })
      .onSuccess(async () => {
        console.log("onSuccess");
        await fetchDraw();
      })
      .onError(async (error) => {
        console.log("onError", error);
      })
      .execute();
  };

  const fetchDraw = async () => {
    const draw = await getDraw(drawId);
    if (draw) {
      setDraw(draw);
    }
  };
  useEffect(() => {
    fetchDraw();
  }, [drawId]);

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

        <main className="flex-1 container py-10">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  } else {
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
              <Link
                href="/admin"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Admin Panel
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <ConnectButton />
            </div>
          </div>
        </header>

        <main className="flex-1 container py-10">
          {/* Rest of your JSX remains the same */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:underline"
              >
                ← Back to admin panel
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Draw Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      ID
                    </dt>
                    <dd className="text-sm font-mono">{draw.id.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Name
                    </dt>
                    <dd className="text-sm">{draw.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      End Epoch
                    </dt>
                    <dd className="text-sm">{draw.end_at}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Confirm Threshold
                    </dt>
                    <dd className="text-sm">{draw.confirm_threshold}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Number of Winners
                    </dt>
                    <dd className="text-sm">{draw.num_winners}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Status
                    </dt>
                    <dd className="text-sm">
                      {draw.publish ? "Published" : "Draft"}
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Confirmed By
                    </dt>
                    <dd className="text-sm font-mono">
                      {draw.confirm_by.length > 0
                        ? draw.confirm_by.join(", ")
                        : "No confirmations yet"}
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Lucky Winners
                    </dt>
                    <dd className="text-sm">
                      {draw.lucky.length > 0
                        ? draw.lucky.join(", ")
                        : "Not drawn yet"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Items Management</CardTitle>
                <AddItemModal onAddItem={handleAddItem} />
              </CardHeader>
              <CardContent>
                {draw.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md border-dashed">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No items added yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Add some items to this draw before publishing.
                    </p>
                  </div>
                ) : (
                  <ItemsList
                    items={draw.items}
                    onRemoveItem={handleRemoveItem}
                    isPublished={draw.publish}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }
}
