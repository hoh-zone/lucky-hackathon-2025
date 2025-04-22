"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ItemInfo } from "@/types/display";

type AddItemModalProps = {
  onAddItem: (item: ItemInfo) => Promise<void>;
  buttonVariant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  buttonText?: string;
  fullWidth?: boolean;
};

export default function AddItemModal({
  onAddItem,
  buttonVariant = "outline",
  buttonText = "Add Item",
  fullWidth = false,
}: AddItemModalProps) {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<ItemInfo>({
    name: "",
    desc: "",
    url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddItem(item);
    setItem({ name: "", desc: "", url: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className={fullWidth ? "w-full" : ""}>
          <Plus className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Add a new prize item to this lucky draw. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={item.name}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                placeholder="e.g. Smartphone"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={item.desc}
                onChange={(e) => setItem({ ...item, desc: e.target.value })}
                placeholder="Brief description of the item"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={item.url}
                onChange={(e) => setItem({ ...item, url: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
