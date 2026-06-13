/// <reference path="../../types/index.d.ts" />

declare function createStandardRouteDispatcher(options: CreateStandardRouteDispatcherOptions): ServerMiddleware;

declare function resolveRouteKey(pathname: string): { id: number; routeKey: string };

export { createStandardRouteDispatcher, resolveRouteKey };
