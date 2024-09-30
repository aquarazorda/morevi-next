import { type ReactNode, Fragment, Suspense } from "react";

export async function* streamToGenerator(
  readable: ReadableStream<unknown>,
): AsyncGenerator<ReactNode, void, unknown> {
  const reader = readable.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      yield value as ReactNode;
    }
  } finally {
    reader.releaseLock();
  }
}

export async function InnerGenerator({
  generator,
  fallback,
}: {
  generator: AsyncGenerator<ReactNode, void, unknown>;
  fallback?: React.ReactNode;
}) {
  const { value, done } = await generator.next();

  if (done) return null;

  return (
    <>
      {value}
      <Suspense fallback={fallback}>
        <InnerGenerator generator={generator} />
      </Suspense>
    </>
  );
}

export function GeneratorComponent({
  readable,
  fallback,
}: {
  readable: ReadableStream<unknown>;
  fallback?: React.ReactNode;
}) {
  return (
    <InnerGenerator
      generator={streamToGenerator(readable)}
      fallback={fallback}
    />
  );
}
