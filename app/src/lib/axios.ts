// src/lib/axios.ts

import axios, { type AxiosError } from "axios";
import { demoAxiosAdapter } from "@/mocks/mockAdapter";

import {
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  saveTokens,
  clearAuthTokens,
} from "@/services/authToken.service";
import { fromRes } from "@/lib/apiError";
import { resolveExpiresAt } from "@/lib/tokenExpiry";
import { ROUTES } from "@/constants/routes";

export const API_BASE_URL = import.meta.env.VITE_DEFAULT_API_BASE_URL || "http://demo.local";
export const IS_DEMO_MODE = import.meta.env.VITE_MOCK_MODE !== "false";

const REFRESH_PATH = "/auth/refresh";

function redirectToLogin() {
  if (typeof window === "undefined") return;

  if (window.location.pathname !== ROUTES.LOGIN) {
    window.location.href = ROUTES.LOGIN;
  }
}

const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

if (IS_DEMO_MODE) {
  refreshApi.defaults.adapter = demoAxiosAdapter;
  publicApi.defaults.adapter = demoAxiosAdapter;
  authApi.defaults.adapter = demoAxiosAdapter;
}

let refreshPromise: Promise<string | null> | null = null;

async function handleAccessTokenRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthTokens();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = refreshApi
      .post(REFRESH_PATH, {
        refresh_token: refreshToken,
      })
      .then((res) => {
        const data = res.data;

        const accessToken = fromRes(data, [
          "access_token",
          "accessToken",
          "token",
          "jwt",
        ]);

        const newRefreshToken =
          fromRes(data, ["refresh_token", "refreshToken"]) || refreshToken;

        if (!accessToken) {
          clearAuthTokens();
          return null;
        }

        const expiresAt = resolveExpiresAt(data, accessToken);

        saveTokens(accessToken, newRefreshToken, expiresAt);

        return accessToken;
      })
      .catch((error) => {
        console.error("[axios] Refresh token failed:", error);
        clearAuthTokens();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

authApi.interceptors.request.use(
  async (config) => {
    let token = getAccessToken();

    if (token && isAccessTokenExpired()) {
      token = await handleAccessTokenRefresh();
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

authApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const newToken = await handleAccessTokenRefresh();

      if (newToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return authApi(originalRequest);
      }

      clearAuthTokens();
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);