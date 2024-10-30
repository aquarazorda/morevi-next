import { getWcProductsFromDate } from "~/server/queries/woocommerce";
import WoltGenerateProductTable from "./table";
import { Either, pipe } from "effect";

export default async function WoltGenerateListPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const data = await getWcProductsFromDate(decodeURIComponent(date));

  if (data._tag === "error") {
    return <div>{data.message}</div>;
  }

  return <WoltGenerateProductTable data={data.value} />;
}
