"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "./ui/button";
import { newDraw } from "@/contracts/new-draw";
import { useBetterSignAndExecuteTransaction } from "@/hooks/useBetterTx";

export default function CreateDrawForm() {
  const [confirmThreshold, setConfirmThreshold] = useState<number>(0);
  const [endEpoch, setEndEpoch] = useState<number>(1);
  const [numWinners, setNumWinners] = useState<number>(1);
  const [drawName, setDrawName] = useState<string>("");

  const { handleSignAndExecuteTransaction: newDrawHandler } =
    useBetterSignAndExecuteTransaction({
      tx: newDraw,
    });

  const {} = useBetterSignAndExecuteTransaction({
    tx: newDraw,
  });

  const handleNewDraw = async (e: React.FormEvent) => {
    e.preventDefault();

    await newDrawHandler({
      name: drawName,
      endAt: endEpoch,
      confirmThreshold: confirmThreshold,
      numWinners: numWinners,
    })
      .onSuccess(async () => {
        console.log("onSuccess");
      })
      .onError(async (error) => {
        console.log("onError", error);
      })
      .execute();
  };

  return (
    <form onSubmit={handleNewDraw} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Draw Name</Label>
        <Input
          id="name"
          placeholder="Enter a name for this lucky draw"
          required
          value={drawName}
          onChange={(e) => setDrawName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="endAt">End Epoch</Label>
          <Input
            id="endAt"
            type="number"
            min={1}
            max={999999}
            value={endEpoch}
            onChange={(e) => setEndEpoch(Number.parseInt(e.target.value))}
            required
          />
          <p className="text-xs text-muted-foreground">
            Number of Epoch required
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmThreshold">Confirmation Threshold</Label>
          <Input
            id="confirmThreshold"
            type="number"
            min={0}
            max={999999}
            value={confirmThreshold}
            onChange={(e) =>
              setConfirmThreshold(Number.parseInt(e.target.value))
            }
            required
          />
          <p className="text-xs text-muted-foreground">
            Number of confirmations required before drawing winners
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="numWinners">Number of Winners</Label>
          <Input
            id="numWinners"
            type="number"
            min={1}
            value={numWinners}
            onChange={(e) => setNumWinners(Number.parseInt(e.target.value))}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Create Lucky Draw
      </Button>
    </form>
  );
}
