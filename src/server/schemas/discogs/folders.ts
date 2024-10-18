import { Schema } from "@effect/schema";

export const discogsFolderSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  count: Schema.Number,
});

export const foldersResponseSchema = Schema.transform(
  Schema.Struct({
    folders: Schema.Array(discogsFolderSchema),
  }),
  Schema.Array(discogsFolderSchema),
  {
    strict: true,
    decode: ({ folders }) => folders,
    encode: (folders) => ({ folders }),
  },
);

export const noteSchema = Schema.Struct({
  field_id: Schema.Number,
  value: Schema.String,
});

export const basicInformationSchema = Schema.Struct({
  id: Schema.Number,
  title: Schema.String,
  artists: Schema.Array(
    Schema.Struct({
      name: Schema.String,
    }),
  ),
  thumb: Schema.optional(Schema.String),
  cover_image: Schema.optional(Schema.String),
  year: Schema.optional(Schema.Number),
  genres: Schema.optional(Schema.Array(Schema.String)),
  styles: Schema.optional(Schema.Array(Schema.String)),
  labels: Schema.Array(
    Schema.Struct({
      id: Schema.Number,
      name: Schema.String,
      catno: Schema.String,
    }),
  ),
});

const releaseSchema = Schema.Struct({
  basic_information: basicInformationSchema,
  notes: Schema.optional(Schema.Array(noteSchema)),
});

export const folderReleasesSchema = Schema.Struct({
  pagination: Schema.Struct({
    page: Schema.Number,
    pages: Schema.Number,
    per_page: Schema.Number,
    items: Schema.Number,
  }),
  releases: Schema.Array(
    Schema.transform(
      releaseSchema,
      Schema.Struct({
        ...basicInformationSchema.fields,
        notes: Schema.optional(Schema.Array(noteSchema)),
      }),
      {
        decode: ({ basic_information, notes }) => ({
          ...basic_information,
          notes,
        }),
        encode: ({ notes, ...rest }) => ({ basic_information: rest, notes }),
      },
    ),
  ),
});
