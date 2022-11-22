/// <reference lib="dom" />

export interface FetchProviderConfig extends RequestInit {
  baseURL?: string;
  auth?: { username: string; password: string };
  validateStatus?: (status: number) => boolean;
  timeout?: number;
  responseType?: "arraybuffer" | "blob" | "json" | "text" | "stream";
}

export interface FetchProviderResponse<Data = unknown> extends Response {
  data: Data;
}
