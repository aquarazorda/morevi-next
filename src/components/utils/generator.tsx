import { Stream } from "effect";
import { type ReactNode, Suspense } from "react";

export async function* streamToGenerator<T>(
  readable: ReadableStream<T[]>,
): AsyncGenerator<T[], void, unknown> {
  const reader = readable.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

export async function InnerGenerator<T>({
  generator,
  children,
  fallback,
}: {
  generator: AsyncGenerator<T[], void, unknown>;
  children: (data: T[]) => ReactNode;
  fallback?: React.ReactNode;
}) {
  const { value, done } = await generator.next();

  if (done) return null;

  return (
    <>
      {children(value)}
      <Suspense fallback={fallback}>
        <InnerGenerator generator={generator}>{children}</InnerGenerator>
      </Suspense>
    </>
  );
}

export function GeneratorComponent<T, E>({
  stream,
  children,
  fallback,
}: {
  stream: Stream.Stream<T[], E>;
  children: (data: T[]) => ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <InnerGenerator
      generator={streamToGenerator<T>(Stream.toReadableStream(stream))}
      fallback={fallback}
    >
      {children}
    </InnerGenerator>
  );
}
