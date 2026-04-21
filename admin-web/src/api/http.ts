import type { ApiResponse } from "../types/api";

export function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof configuredBaseUrl === "string" && configuredBaseUrl.trim()) {
    return configuredBaseUrl.trim();
  }

  return "";
}

const DEFAULT_TIMEOUT = 10000;

function isAbortError(error: unknown) {
  return (
    (error instanceof Error && error.name === "AbortError") ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name?: string }).name === "AbortError")
  );
}

function buildHeaders(
  options: RequestInit,
  tokenName?: string,
  tokenValue?: string,
) {
  const headers = new Headers(options.headers);
  const shouldSetJsonContentType =
    options.body &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof Blob) &&
    !(options.body instanceof URLSearchParams) &&
    !(options.body instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(options.body);

  if (shouldSetJsonContentType && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (tokenName && tokenValue) {
    headers.set(tokenName, tokenValue);
  }
  return headers;
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function resolveErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as { message?: unknown }).message === "string"
  ) {
    return (payload as { message: string }).message;
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return fallback;
}

async function request<T>(
  path: string,
  options: RequestInit & { tokenName?: string; tokenValue?: string } = {},
  wrapped = false,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      headers: buildHeaders(options, options.tokenName, options.tokenValue),
      signal: controller.signal,
    });
    const payload = await parseResponse(response);

    if (wrapped) {
      const json = payload as ApiResponse<T> | null;
      if (!response.ok) {
        throw new Error(
          resolveErrorMessage(json, `请求失败：${response.status}`),
        );
      }
      if (!json) {
        throw new Error("接口返回为空");
      }
      if (json.code !== 0) {
        throw new Error(json.message || "请求失败");
      }
      return json.data as T;
    }

    if (!response.ok) {
      throw new Error(
        resolveErrorMessage(payload, `请求失败：${response.status}`),
      );
    }

    return payload as T;
  } catch (error) {
    if (isAbortError(error)) {
      const apiBaseUrl = getApiBaseUrl() || window.location.origin;
      throw new Error(`接口请求超时，请检查后端地址是否可访问：${apiBaseUrl}`);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("请求失败");
  } finally {
    clearTimeout(timeoutId);
  }
}

export function requestApi<T>(
  path: string,
  options: RequestInit & { tokenName?: string; tokenValue?: string } = {},
) {
  return request<T>(path, options, true);
}

export function requestRaw<T>(
  path: string,
  options: RequestInit & { tokenName?: string; tokenValue?: string } = {},
) {
  return request<T>(path, options, false);
}
