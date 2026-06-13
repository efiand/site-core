/// <reference path="../../types/index.d.ts" />

declare function deleteCookie(res: RouteResponse, name: string, path?: string): void;

declare function getCookies(req: RouteRequest): Record<string, string | undefined>;

declare function setCookie(res: RouteResponse, body: CookieBody): void;

export { deleteCookie, getCookies, setCookie };
