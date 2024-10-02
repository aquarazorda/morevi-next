"use client";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SearchInput(props: { value?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(props.value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   router.replace(`/?q=${encodeURIComponent(value)}`);
  // }, [router, value]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="search"
        className="mb-4 h-8 border-[#333] bg-[#1A1A1A] pr-8 text-xs focus-visible:ring-0 [&::-webkit-search-cancel-button]:appearance-none"
        style={{
          WebkitAppearance: "none",
          MozAppearance: "none",
          appearance: "none",
        }}
        placeholder="Search"
        value={value}
        onChange={(e) => {
          setValue(e.currentTarget.value);
        }}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
          onClick={() => setValue("")}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      ) : (
        <div className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded border border-neutral-700 bg-neutral-800 text-neutral-400">
          <span className="font-mono text-xs">/</span>
        </div>
      )}
    </div>
  );
}
