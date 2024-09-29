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

export async function GeneratorComponent({
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
        <GeneratorComponent generator={generator} />
      </Suspense>
    </>
  );
}
