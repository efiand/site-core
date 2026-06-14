/// <reference path="../../types/index.d.ts" />

declare function createStandardRouteDispatcher(options: CreateStandardRouteDispatcherOptions): ServerMiddleware;

declare function resolvePathnamePrefix(prefix: string, urlPathname: string): { isPrefixed: boolean; pathname: string };

declare function resolveRouteKey(pathname: string): { id: number; routeKey: string };

export { createStandardRouteDispatcher, resolvePathnamePrefix, resolveRouteKey };
