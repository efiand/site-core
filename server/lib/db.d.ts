/// <reference path="../../types/index.d.ts" />

declare function closeDbPool(): Promise<void>;

declare function getDbError(error: unknown): string;

declare function processDb(query: string, payload?: DbPlaceholder): Promise<unknown>;

export { closeDbPool, getDbError, processDb };
