import { Context, Effect, pipe } from "effect";
import slsk from "slsk-client";
import { env } from "~/env";

// Soulseek client configuration
const slskConfig = {
  user: env.SLSK_USER,
  pass: env.SLSK_PASS,
};

// Create a Soulseek client
export const createSlskClient: Effect.Effect<slsk.SlskClient, Error> =
  Effect.asyncEffect((resume) => {
    slsk.connect(slskConfig, (err, client) => {
      console.log(client);
      if (err) {
        resume(Effect.fail(err));
      } else {
        resume(Effect.succeed(client));
      }
    });

    return Effect.void;
  });

export class SlskClient extends Context.Tag("SoulseekClient")<
  SlskClient,
  Effect.Effect<slsk.SlskClient, Error>
>() {}

// Search Soulseek function
export const searchSoulseek = (query: string) =>
  Effect.gen(function* () {
    const slskClient = yield* SlskClient;
    const client = yield* slskClient;

    const results = yield* Effect.tryPromise(
      () =>
        new Promise<slsk.SearchResult[]>((resolve, reject) => {
          client.search({ req: query, timeout: 5000 }, (err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
        }),
    );

    return results;
  });

export const searchYoutubeNamesOnSoulseek = (videoNames: string[]) =>
  pipe(
    Effect.succeed(videoNames),
    Effect.map((names) => names.map(cleanupVideoName)),
    Effect.flatMap((cleanedNames) =>
      Effect.forEach(cleanedNames, (name) =>
        pipe(
          searchSoulseek(name),
          Effect.tap((results) =>
            Effect.log(`Found ${results.length} results for "${name}"`),
          ),
          Effect.catchAll((error) =>
            Effect.log(`Error searching for "${name}": ${error.message}`),
          ),
        ),
      ),
    ),
  );

// Helper function to clean up video names
const cleanupVideoName = (name: string): string => {
  return name
    .replace(/\(.*?\)/g, "") // Remove content within parentheses
    .replace(/\[.*?\]/g, "") // Remove content within square brackets
    .replace(/official\s*(video|audio|music video)/gi, "") // Remove "official video" etc.
    .replace(/ft\.?|feat\.?/gi, "") // Remove "ft." or "feat."
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim(); // Remove leading and trailing whitespace
};
