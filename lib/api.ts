function getApiBaseUrl() {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  return "https://www.cenzen.cloud";
}

export const API_BASE_URL = getApiBaseUrl();

console.info(`[api] API_BASE_URL=${API_BASE_URL}`);

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
}

export interface CaptchaResponse {
  captchaId: string;
  imageBase64: string;
  expireSeconds: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  nickname: string;
  avatarUrl: string | null;
  userType: number | null;
  vipLevel: number | null;
  level: number | null;
  status: number | null;
  lastLoginTime: string | null;
  lastLoginIp: string | null;
}

export interface SystemUserRecord {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  nickname: string;
  avatarUrl: string | null;
  userType: number | null;
  vipLevel: number | null;
  level: number | null;
  status: number | null;
  lastLoginTime: string | null;
  lastLoginIp: string | null;
}

export interface LoginResponse {
  tokenName: string;
  tokenValue: string;
  user: UserProfile;
}

export interface LoginRequest {
  account: string;
  password: string;
  captchaId: string;
  captchaCode: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phone?: string;
  password: string;
  nickname?: string;
  captchaId: string;
  captchaCode: string;
}

export interface ForgotPasswordRequest {
  account: string;
  newPassword: string;
  captchaId: string;
  captchaCode: string;
}

type RequestOptions = RequestInit & {
  tokenName?: string;
  tokenValue?: string;
};

function isAbortError(error: unknown) {
  if (error instanceof Error) {
    return error.name === "AbortError";
  }

  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "AbortError"
  );
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
  wrapped = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (options.tokenName && options.tokenValue) {
    headers.set(options.tokenName, options.tokenValue);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    if (!wrapped) {
      if (!response.ok) {
        throw new Error(`请求失败：${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        return null as T;
      }

      return JSON.parse(text) as T;
    }

    const json = (await response.json()) as ApiResponse<T>;
    if (!response.ok || json.code !== 0) {
      throw new Error(json.message || "请求失败");
    }
    return json.data as T;
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error(
        `接口请求超时，请检查后端地址是否可访问：${API_BASE_URL}`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestRaw<T>(
  path: string,
  options: RequestOptions = {},
) {
  return request<T>(path, options, false);
}

export async function requestApi<T>(
  path: string,
  options: RequestOptions = {},
) {
  return request<T>(path, options, true);
}

export async function fetchCaptcha() {
  return request<CaptchaResponse>("/api/auth/captcha");
}

export async function login(payload: LoginRequest) {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterRequest) {
  return request<LoginResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(payload: ForgotPasswordRequest) {
  return request<void>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(tokenName: string, tokenValue: string) {
  return request<UserProfile>("/api/auth/me", {
    method: "GET",
    tokenName,
    tokenValue,
  });
}

export async function logout(tokenName: string, tokenValue: string) {
  return request<void>("/api/auth/logout", {
    method: "POST",
    tokenName,
    tokenValue,
  });
}

export async function fetchSystemUserById(id: number) {
  return requestRaw<SystemUserRecord>(`/api/system/users/${id}`);
}
