import { Link } from "@radix-ui/themes/components/link";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-pink-50 to-white">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Blockchain-Powered Lucky Draws
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Participate in transparent, fair, and exciting lucky draws
                powered by Sui blockchain technology.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/draws">
                <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
                  Explore Draws
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[350px] w-[350px] md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-[300px] w-[300px] md:h-[350px] md:w-[350px] lg:h-[450px] lg:w-[450px] rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-70 animate-pulse"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-8 rounded-full shadow-lg">
                  <Trophy className="h-24 w-24 text-pink-500" />
                </div>
              </div>
              <div className="absolute top-1/4 right-1/4 animate-float"></div>
              <div className="absolute bottom-1/4 left-1/4 animate-float-delay"></div>
              <div className="absolute top-1/2 left-1/6 animate-float-long"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
