import { getWcProductsFromDate } from "~/server/queries/woocommerce";
import WoltGenerateProductTable from "./table";
import { Either, pipe } from "effect";

export default async function WoltGenerateListPage({
  params: { date },
}: {
  params: { date: string };
}) {
  const data = await getWcProductsFromDate(decodeURIComponent(date));

  return pipe(
    data,
    Either.match({
      onLeft: (e) => <div>{e}</div>,
      // @ts-expect-error fix it later
      onRight: (d) => <WoltGenerateProductTable data={d} />,
    }),
  );
}
