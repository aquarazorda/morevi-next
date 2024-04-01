export class FetchError {
  readonly _tag = "FetchError";
  constructor(readonly error: unknown) {}
}

export class JSONError {
  readonly _tag = "JSONError";
  constructor(readonly error: unknown) {}
}
