import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "./ui/button";
import { useNewDrawMutation } from "@/mutations/useNewDrawMutation";

export default function CreateDrawForm() {
  const { mutate: newDrawMutation } = useNewDrawMutation();
  const [confirmThreshold, setConfirmThreshold] = useState<number>(0);
  const [endEpoch, setEndEpoch] = useState<number>(735);
  const [numWinners, setNumWinners] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    newDrawMutation({
      inputNewDraw: {
        endAt: endEpoch,
        confirmThreshold: confirmThreshold,
        num: numWinners,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Draw Name</Label>
        <Input
          id="name"
          placeholder="Enter a name for this lucky draw"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="endAt">End Epoch</Label>
          <Input
            id="endAt"
            type="number"
            min={735}
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
