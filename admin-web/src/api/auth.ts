import type {
    AuthSession,
    CaptchaResponse,
    LoginRequest,
    LoginResponse,
    UserProfile,
} from "../types/api";
import { requestApi } from "./http";

const AUTH_STORAGE_KEY = "myant-admin-auth-session";

export function loadAuthSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveAuthSession(session: AuthSession) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function fetchCaptcha() {
  return requestApi<CaptchaResponse>("/api/auth/captcha");
}

export async function loginApi(payload: LoginRequest) {
  return requestApi<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function currentUserApi(session: AuthSession) {
  return requestApi<UserProfile>("/api/auth/me", {
    method: "GET",
    tokenName: session.tokenName,
    tokenValue: session.tokenValue,
  });
}

export async function logoutApi(session: AuthSession) {
  return requestApi<void>("/api/auth/logout", {
    method: "POST",
    tokenName: session.tokenName,
    tokenValue: session.tokenValue,
  });
}
