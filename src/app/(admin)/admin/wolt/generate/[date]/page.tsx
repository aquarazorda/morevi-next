import { fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { getWcProductsFromDate } from "~/server/queries/woocommerce";
import WoltGenerateProductTable from "./table";

export default async function WoltGenerateListPage({
  params: { date },
}: {
  params: { date: string };
}) {
  const data = await getWcProductsFromDate(decodeURIComponent(date));

  return pipe(
    data,
    fold(
      (e) => <div>{e}</div>,
      (d) => <WoltGenerateProductTable data={d} />,
    ),
  );
}
