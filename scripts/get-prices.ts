import { Effect } from "effect";
import { type Schema } from "@effect/schema";
import { getDiscogs } from "~/server/queries/discogs";
import { folderReleasesSchema } from "~/server/schemas/discogs/folders";
import { priceStatisticsSchema } from "~/server/schemas/discogs/prices";
// import { marketplaceListingsSchema } from "~/server/schemas/discogs/marketplace";
import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

const folderId = "7900644";

const foldersPath = "/users/MoreviTBS/collection/folders";
const MAX_RELEASES_TO_CHECK = 0; // Set to 0 to check all releases
const RELEASES_PER_PAGE = 100;
const MULTIPLIER = 4.5;
const DELAY_MS = 1200; // 2 seconds delay between requests

function* fetchAllReleases() {
  let page = 1;
  let allReleases: (typeof folderReleasesSchema.Type)["releases"] = [];
  let hasMorePages = true;

  while (hasMorePages) {
    const response = yield* getDiscogs(
      `${foldersPath}/${folderId}/releases?sort=added&sort_order=desc&per_page=${RELEASES_PER_PAGE}&page=${page}`,
      folderReleasesSchema,
    );

    allReleases = [...allReleases, ...response.releases];

    if (
      MAX_RELEASES_TO_CHECK > 0 &&
      allReleases.length >= MAX_RELEASES_TO_CHECK
    ) {
      allReleases = allReleases.slice(0, MAX_RELEASES_TO_CHECK);
      hasMorePages = false;
    } else {
      hasMorePages = response.pagination.page < response.pagination.pages;
      page++;
    }
  }

  return allReleases;
}

function createExcelFile(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Releases");

  const outputDir = path.resolve(__dirname, "../output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, filename);
  XLSX.writeFile(workbook, filePath);
  console.log(`Excel file saved to: ${filePath}`);
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const delayedGetDiscogs = <T>(endpoint: string, schema: Schema.Schema<T>) =>
  Effect.gen(function* () {
    yield* Effect.tryPromise(() => delay(DELAY_MS));
    return yield* getDiscogs(endpoint, schema);
  });

Effect.gen(function* () {
  const releases = yield* fetchAllReleases();

  const releasesWithPrices = yield* Effect.forEach(releases, (release) =>
    Effect.gen(function* () {
      const priceStats = yield* delayedGetDiscogs(
        `/marketplace/price_suggestions/${release.id}`,
        priceStatisticsSchema,
      ).pipe(Effect.catchAll(() => Effect.succeed(null)));

      // const currentListings = yield* Effect.forEach(currencies, (currency) =>
      //   Effect.gen(function* () {
      //     const listings = yield* delayedGetDiscogs(
      //       `/marketplace/listings/${release.id}?currency=${currency}&sort=price&sort_order=asc`,
      //       marketplaceListingsSchema,
      //     );
      //     return {
      //       currency,
      //       listings: listings.listings.slice(0, 5), // Get the 5 cheapest listings
      //     };
      //   }),
      // );

      console.log(
        "Fetched price stats for",
        release.id,
        release.artists[0]?.name,
        release.title,
      );

      if (!priceStats) {
        return {
          id: release.id,
          name: release.artists[0]?.name + " - " + release.title,
          condition: "Unknown",
          price: 0,
          message: "Could not find prices",
        };
      }

      if (!release.notes?.[0]?.value) {
        return {
          id: release.id,
          name: release.artists[0]?.name + " - " + release.title,
          condition: "Unknown",
          price: 0,
          message: "Unknown condition - " + JSON.stringify(priceStats, null, 2),
        };
      }

      const price = Math.round(
        priceStats[release.notes[0].value as keyof typeof priceStats]?.value *
          MULTIPLIER,
      );

      return {
        id: release.id,
        name: release.artists[0]?.name + " - " + release.title,
        condition: release.notes[0].value,
        price: price !== Number.NaN ? price : 0,
        message:
          price === Number.NaN
            ? "Could not calculate price - " +
              JSON.stringify(priceStats, null, 2)
            : "",
      };
    }),
  );

  createExcelFile(releasesWithPrices, "release_prices.xlsx");
}).pipe(Effect.tapError(Effect.logError), Effect.runCallback);
