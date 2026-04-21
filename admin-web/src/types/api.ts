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

export interface LoginResponse {
  tokenName: string;
  tokenValue: string;
  user: UserProfile;
}

export interface AuthSession extends LoginResponse {}

export interface LoginRequest {
  account: string;
  password: string;
  captchaId: string;
  captchaCode: string;
}
