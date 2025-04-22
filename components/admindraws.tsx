"use client";

import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Plus, ShieldCheck, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Draw } from "@/types/display";
import Link from "next/link";
import { getAllDraws, getCurrentEpoch } from "@/contracts/get-object";
import { publishDraw } from "@/contracts/publlish";
import { luckyDraw } from "@/contracts/lucky-draw";
import { useBetterSignAndExecuteTransaction } from "@/hooks/useBetterTx";

export default function AdminDraws() {
  const [draws, setDraws] = useState<Draw[]>();
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const { handleSignAndExecuteTransaction: publishDrawHandler } =
    useBetterSignAndExecuteTransaction({
      tx: publishDraw,
    });

  const { handleSignAndExecuteTransaction: luckyDrawHandler } =
    useBetterSignAndExecuteTransaction({
      tx: luckyDraw,
    });

  useEffect(() => {
    const fetchData = async () => {
      const all = await getAllDraws();
      const epoch = await getCurrentEpoch();

      if (all.length > 0) {
        setDraws(all);
      }
      setCurrentEpoch(epoch);
    };
    fetchData();
  }, []);

  const handlePublishDraw = async (drawId: string) => {
    await publishDrawHandler({
      drawId: drawId,
    })
      .onSuccess(async () => {
        console.log("Publish success");
        const all = await getAllDraws();
        if (all.length > 0) {
          setDraws(all);
        }
      })
      .onError(async (error) => {
        console.log("Publish error", error);
      })
      .execute();
  };

  const handleLuckyDraw = async (drawId: string) => {
    await luckyDrawHandler({
      drawId: drawId,
    })
      .onSuccess(async () => {
        console.log("Lucky draw success");
        const all = await getAllDraws();
        if (all.length > 0) {
          setDraws(all);
        }
      })
      .onError(async (error) => {
        console.log("Lucky draw error", error);
      })
      .execute();
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>EndAtEpoch</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Publish</TableHead>
              <TableHead>Confirmations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {draws?.map((draw) => (
              <TableRow key={draw.id.id}>
                <TableCell className="font-medium">{draw.name}</TableCell>
                <TableCell>{draw.end_at}</TableCell>
                <TableCell>{draw.items.length}</TableCell>
                <TableCell>
                  {draw.publish ? (
                    <Badge className="bg-green-500">Published</Badge>
                  ) : (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {draw.confirm_by?.length ?? 0}/{draw.confirm_threshold ?? 0}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-2 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>

                      {/* Edit option - only for unpublished draws */}
                      {!draw.publish && (
                        <DropdownMenuItem>
                          <Link
                            href={`/admin/draws/${draw.id.id}`}
                            className="flex items-center"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Draw
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {/* Publish option - only for unpublished draws */}
                      {!draw.publish && (
                        <DropdownMenuItem>
                          <Button
                            variant="ghost"
                            className="flex items-center w-full justify-start p-0"
                            onClick={() => handlePublishDraw(draw.id.id)}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Publish Draw
                          </Button>
                        </DropdownMenuItem>
                      )}

                      {/* Lucky Draw option - only for published draws with enough confirmations and past end epoch */}
                      {draw.publish &&
                        draw.confirm_by.length >= draw.confirm_threshold &&
                        draw.lucky.length === 0 &&
                        draw.end_at < currentEpoch && (
                          <DropdownMenuItem>
                            <Button
                              variant="ghost"
                              className="flex items-center w-full justify-start p-0 text-pink-600"
                              onClick={() => handleLuckyDraw(draw.id.id)}
                            >
                              <Gift className="mr-2 h-4 w-4" />
                              Draw Lottery
                            </Button>
                          </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
