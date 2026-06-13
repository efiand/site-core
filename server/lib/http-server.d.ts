/// <reference path="../../types/index.d.ts" />

declare function closeApp(server?: import('node:http').Server): Promise<void>;

declare function createHttpServer(options: CreateHttpServerOptions): import('node:http').Server;

declare function getAppHost(server?: import('node:http').Server): string;

declare function waitForApp(server: import('node:http').Server): Promise<void>;

export { closeApp, createHttpServer, getAppHost, waitForApp };
