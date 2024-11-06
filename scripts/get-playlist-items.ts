import { Effect, Stream } from "effect";
import { oauth2Client } from "~/server/auth/youtube-oauth";
import {
  fetchUserPlaylists,
  type YoutubePlaylistInfo,
} from "~/server/digg/youtube/playlist";
import { fetchAndInsertPlaylistItems } from "~/server/digg/youtube/playlist-items";
import fs from "fs/promises";
import { exit } from "process";

const playlistsToFetch = ["YAMADUB", "BYGONES II"].map((p) => p.toLowerCase());

const accessToken =
  "ya29.a0AeDClZArGyolbtmN4YwJq6pPaEC_i2EDT6iQzi0J-iw_7FOerSqviZ6ySlG9UwSrao4t2dv6M5Mth-5LP9XDRZJZR7dTuvJ3QqxFDZ4GuLj_qz_MTNReak3hLUrSSBWLheC_Sfs9Bee0fEQ6bFjuN-GN3ZxyhLH93DhuZRsqaCgYKAaoSARESFQHGX2MisqVDwOq9kUykzpq5ucxzlQ0175";
const refreshToken =
  "1%2F%2F03GpQC2SvFYV5CgYIARAAGAMSNwF-L9IrIVUeAbBiguV3UHo4exG_jwdYlTWs-fv1_0L11Ic4ID8V43H1nHW3RLgGAmkXX3Es-tM";

oauth2Client.setCredentials({
  access_token: accessToken,
  refresh_token: refreshToken,
});

const getPlaylists = Effect.gen(function* () {
  let playlists: YoutubePlaylistInfo[] = [];
  let nextPageToken: string | undefined;

  yield* Effect.log("Fetching playlists");
  do {
    const { playlists: newPlaylists, nextPageToken: newNextPageToken } =
      yield* fetchUserPlaylists(nextPageToken);
    playlists = [...playlists, ...newPlaylists];
    nextPageToken = newNextPageToken;
  } while (nextPageToken);

  yield* Effect.log(playlists);

  return playlists;
});

const fetchAndWritePlaylistItems = (name: string, playlistId: string) =>
  Effect.gen(function* () {
    yield* Effect.log(`Fetching ${name}`);
    const fileName = `./output/youtube/${name}.txt`;
    yield* Effect.tryPromise(() => fs.writeFile(fileName, ""));

    const cleanTitle = (title: string, index: number) => {
      const cleanedTitle = title
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .toLowerCase()
        .trim();
      return `${index + 1}. ${cleanedTitle}\n`;
    };

    let index = 0;
    yield* fetchAndInsertPlaylistItems(playlistId).pipe(
      Stream.map((items) =>
        items.map((item) => cleanTitle(item.title, index++)),
      ),
      Stream.runForEach((items) =>
        Effect.tryPromise(() => fs.appendFile(fileName, items.join(""))),
      ),
    );

    yield* Effect.log(`Wrote ${fileName}`);
    return Effect.succeed({});
  });

const program = Effect.gen(function* () {
  const playlists = yield* getPlaylists;
  const toFetch = playlists.filter((p) =>
    playlistsToFetch.includes(p.name.toLowerCase()),
  );

  yield* Effect.log(toFetch);
  yield* Effect.forEach(toFetch, (p) =>
    fetchAndWritePlaylistItems(p.name, p.externalId),
  );

  return Effect.succeed({});
});

await Effect.runPromiseExit(program);
exit(0);
