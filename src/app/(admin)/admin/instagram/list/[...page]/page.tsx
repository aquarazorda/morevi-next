"use server";

import { getWcProducts } from "~/server/queries/woocommerce";
import InstagramListTable from "./table";
import { isLeft } from "effect/Either";

export default async function InstagramListPage({
  params,
}: {
  params: Promise<{ page?: string[] }>;
}) {
  const { page } = await params;
  const pageNumber = page?.[0] ? Number(page[0]) : 1;
  const data = await getWcProducts(pageNumber);

  return (
    <InstagramListTable
      page={pageNumber}
      data={isLeft(data) ? { data: [] } : data.right}
    />
  );
}
