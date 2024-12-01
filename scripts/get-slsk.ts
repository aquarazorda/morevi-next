import { Effect } from "effect";
import { exit } from "process";
import {
  createSlskClient,
  searchYoutubeNamesOnSoulseek,
  SlskClient,
} from "~/server/digg/soulseek";

const program = Effect.gen(function* () {
  const results = yield* searchYoutubeNamesOnSoulseek([
    "shawn ward mood switch",
  ]);
  console.log(results);
});

const runnable = Effect.provideService(program, SlskClient, createSlskClient);

await Effect.runPromise(runnable);
exit(0);
