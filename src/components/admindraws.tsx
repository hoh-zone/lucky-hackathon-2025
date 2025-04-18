import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Draw } from "@/types/display";
import { getAllDraws } from "@/actions/getObject";

export default function AdminDraws() {
  const [draws, setDraws] = useState<Draw[]>();

  useEffect(() => {
    const fetchDraws = async () => {
      const all = await getAllDraws();
      if (all.length > 0) {
        setDraws(all);
      }
    };

    fetchDraws();
  }, []);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Link to="/admin?tab=create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Draw
          </Button>
        </Link>
      </div>

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
              <TableRow key={draw.id}>
                <TableCell className="font-medium">{draw.name}</TableCell>
                <TableCell>{draw.endAt}</TableCell>
                <TableCell>{draw.items.length}</TableCell>
                <TableCell>
                  {draw.publish ? (
                    <Badge className="bg-green-500">Published</Badge>
                  ) : (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {draw.confirmBy.length}/{draw.confirmThreshold}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link
                          to={`/admin/draws/${draw.id}`}
                          className="flex items-center"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Draw
                        </Link>
                      </DropdownMenuItem>
                      {/* {!draw.publish && (
                        <>
                          <DropdownMenuItem>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                          <DropdownMenuSeparator />
                        </>
                      )} */}
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
