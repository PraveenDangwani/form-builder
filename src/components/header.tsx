"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFormStore } from "@/lib/store";

const Header = () => {
  const mode = useFormStore((s) => s.mode);
  const setMode = useFormStore((s) => s.setMode);

  const isBuilder = mode === "builder";
  const isPreview = mode === "preview";

  return (
    <header className="flex items-center justify-between bg-white text-gray-900 p-4 border-b border-black/5 h-16">
      <h1 className="font-semibold">Form Builder</h1>

      <div className="flex items-center gap-2">
        <Button
          variant={isBuilder ? "default" : "outline"}
          size="sm"
          className={isBuilder ? "bg-blue-600 text-white" : "text-gray-700"}
          onClick={() => setMode("builder")}
        >
          Builder
        </Button>
        <Button
          variant={isPreview ? "default" : "outline"}
          size="sm"
          className={isPreview ? "bg-blue-600 text-white" : "text-gray-700"}
          onClick={() => setMode("preview")}
        >
          Preview
        </Button>

        <Link href="/builder">
          <Button variant="outline" size="sm" className="text-gray-700">
            Publish
          </Button>
        </Link>
      </div>
    </header>
  );
};

export { Header };
