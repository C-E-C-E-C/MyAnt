import AsyncStorage from "@react-native-async-storage/async-storage";

import type { LoginResponse, UserProfile } from "@/lib/api";

const AUTH_SESSION_KEY = "@myantapp/auth-session";

export interface AuthSession {
  tokenName: string;
  tokenValue: string;
  user: UserProfile;
}

export async function saveAuthSession(session: AuthSession) {
  await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function loadAuthSession() {
  const value = await AsyncStorage.getItem(AUTH_SESSION_KEY);
  if (!value) {
    return null;
  }
  return JSON.parse(value) as AuthSession;
}

export async function clearAuthSession() {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
}

export function toAuthSession(loginResponse: LoginResponse): AuthSession {
  return {
    tokenName: loginResponse.tokenName,
    tokenValue: loginResponse.tokenValue,
    user: loginResponse.user,
  };
}
