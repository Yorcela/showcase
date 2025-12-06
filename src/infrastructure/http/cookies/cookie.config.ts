import { CookieOptions, Response } from "express";
import { AppConfig } from "@shared/modules/config/app.config";
import { SecuredToken } from "@apptypes/secured-token.type";

export const REFRESH_COOKIE_NAME = "auth-rt";

const baseCookieOptions = (appConfig: AppConfig): CookieOptions => {
  const crossSite =
    appConfig.getFrontendUrl()?.includes("://") &&
    !appConfig.getFrontendUrl().includes(new URL(appConfig.getAppUrl()).host);

  const sameSite: CookieOptions["sameSite"] = crossSite ? "none" : "lax";

  return {
    httpOnly: true,
    secure: appConfig.isProduction() || sameSite === "none",
    sameSite,
    path: `/${appConfig.getApiPrefix()}`,
  };
};

export const buildRefreshCookieOptions = (
  appConfig: AppConfig,
  maxAgeMs?: number,
): CookieOptions => ({
  ...baseCookieOptions(appConfig),
  ...(typeof maxAgeMs === "number" ? { maxAge: maxAgeMs } : {}),
});

export const buildClearRefreshCookieOptions = (appConfig: AppConfig): CookieOptions => ({
  ...baseCookieOptions(appConfig),
  maxAge: 0,
});

export const setRefreshTokenCookie = (
  res: Response,
  appConfig: AppConfig,
  refreshToken: SecuredToken,
  refreshTokenExpiresAt: number,
): void => {
  const maxAge = Math.max(0, refreshTokenExpiresAt - Date.now());
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, buildRefreshCookieOptions(appConfig, maxAge));
};
