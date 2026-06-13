/// <reference path="../../types/index.d.ts" />

/** Только чтение; без побочных эффектов. */
declare function getSiteConfig(): SiteConfigState;

/** Только запись; без возвращаемого значения. */
declare function setSiteConfig(patch: SiteConfigPatch): void;

export { getSiteConfig, setSiteConfig };
