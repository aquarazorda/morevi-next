import * as S from "@effect/schema/Schema";

export const discogsFolderSchema = S.struct({
  id: S.number,
  name: S.string,
  count: S.number,
});

export const foldersResponseSchema = S.struct({
  folders: S.array(discogsFolderSchema),
}).pipe(
  S.transform(
    S.array(discogsFolderSchema),
    ({ folders }) => folders,
    (folders) => ({ folders }),
  ),
);

export const noteSchema = S.struct({
  field_id: S.number,
  value: S.string,
});

export const basicInformationSchema = S.struct({
  id: S.number,
  title: S.string,
  artists: S.array(
    S.struct({
      name: S.string,
    }),
  ),
  thumb: S.optional(S.string),
  cover_image: S.optional(S.string),
  year: S.optional(S.number),
  genres: S.optional(S.array(S.string)),
  styles: S.optional(S.array(S.string)),
  labels: S.array(
    S.struct({
      id: S.number,
      name: S.string,
      catno: S.string,
    }),
  ),
});

const releaseSchema = S.struct({
  basic_information: basicInformationSchema,
  notes: S.optional(S.array(noteSchema)),
});

export const folderReleasesSchema = S.struct({
  pagination: S.struct({
    page: S.number,
    pages: S.number,
    per_page: S.number,
    items: S.number,
  }),
  releases: S.array(
    releaseSchema.pipe(
      S.transform(
        S.struct({
          ...basicInformationSchema.fields,
          notes: S.optional(S.array(noteSchema)),
        }),
        ({ basic_information, notes }) =>
          ({ ...basic_information, notes }) as const,
        ({ notes, ...rest }) => ({ basic_information: rest, notes }),
      ),
    ),
  ),
});
