"use server";

import { getWcProducts } from "~/server/queries/woocommerce";
import InstagramListTable from "./table";
import { isLeft } from "effect/Either";

export default async function InstagramListPage({
  params,
}: {
  params: { page?: string[] };
}) {
  const page = params.page?.[0] ? Number(params.page[0]) : 1;
  const data = await getWcProducts(page);

  return (
    <InstagramListTable
      page={page}
      data={isLeft(data) ? { data: [] } : data.right}
    />
  );
}
