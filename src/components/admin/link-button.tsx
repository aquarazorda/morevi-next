"use client";

import { Button } from "../ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  href: string;
  title: string;
  icon: ReactNode;
};

export default function AdminNavbarLinkButton({ href, icon, title }: Props) {
  const path = usePathname();

  return (
    <Button
      variant={
        (href !== "/admin" && path.startsWith(href)) ||
        (href === "/admin" && path === "/admin")
          ? "secondary"
          : "ghost"
      }
      className="w-full justify-start"
      key={title}
      asChild
    >
      <Link href={href} prefetch={false}>
        {icon} {title}
      </Link>
    </Button>
  );
}
