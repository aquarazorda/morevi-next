"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { capitalize } from "~/lib/utils";

export default function DiscogsBreadCrumbs() {
  const pathname = usePathname();
  const pathParts = pathname.split("/").slice(2);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/admin" prefetch={false}>
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathParts.map((path) => (
          <Fragment key={path}>
            <BreadcrumbSeparator />
            {pathname.endsWith(path) ? (
              <BreadcrumbPage>{capitalize(path)}</BreadcrumbPage>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={pathname.split(path)[0] + path ?? "/admin"}
                    prefetch={false}
                  >
                    {capitalize(path)}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
