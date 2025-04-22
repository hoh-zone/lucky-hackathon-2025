"use client";

import AdminDraws from "@/components/admindraws";
import CreateDrawForm from "@/components/create-draw-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectButton } from "@mysten/dapp-kit";
import { ShieldCheck, Trophy } from "lucide-react";
import Link from "next/link";

export default function AdminPanel() {
  //   const defaultTab = location.search === "?tab=create" ? "create" : "draws";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold">LuckyDraw</span>
            <Badge className="ml-2 bg-pink-500">Admin</Badge>
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

      <main className="container flex-1 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Cap Connected
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="draws" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="draws">Manage Draws</TabsTrigger>
            <TabsTrigger value="create">Create Draw</TabsTrigger>
          </TabsList>

          <TabsContent value="draws" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lucky Draw Boards</CardTitle>
                <CardDescription>
                  Manage your existing lucky draw boards, add items, and confirm
                  results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminDraws />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Lucky Draw</CardTitle>
                <CardDescription>
                  Set up a new lucky draw board.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateDrawForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
