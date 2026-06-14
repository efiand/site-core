/// <reference path="../../types/index.d.ts" />

/** Хост: dev — `fallback`, prod — mtime `sourcePath` (файл, не БД). */
declare function resolveSourcePublishedTime(options: { fallback: string; sourcePath: string }): Promise<string>;

export { resolveSourcePublishedTime };
