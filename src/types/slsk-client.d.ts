declare module "slsk-client" {
  export interface SlskClient {
    search: (
      options: { req: string; timeout: number },
      callback: (err: Error | null, results: SearchResult[]) => void,
    ) => void;
  }

  export interface SearchResult {
    user: string;
    file: string;
    size: number;
    slots: boolean;
    bitrate?: number;
    speed?: number;
  }

  export function connect(
    options: { user: string; pass: string },
    callback: (err: Error | null, client: SlskClient) => void,
  ): void;
}
