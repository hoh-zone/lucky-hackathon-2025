"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Eye, ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBetterSignAndExecuteTransaction } from "@/hooks/useBetterTx";

type ItemInfo = {
  name: string;
  desc: string;
  url: string;
};

type ItemsListProps = {
  items: ItemInfo[];
  onRemoveItem: (index: number) => void;
  isPublished: boolean;
};

export default function ItemsList({
  items,
  onRemoveItem,
  isPublished,
}: ItemsListProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.desc}
                </p>
                {item.url}
              </div>

              <div className="flex items-start gap-2 mt-2 md:mt-0">
                {!isPublished && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to remove this item?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          remove the item from this draw.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => onRemoveItem(index)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
