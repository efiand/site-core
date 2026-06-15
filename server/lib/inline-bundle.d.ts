/// <reference path="../../types/index.d.ts" />

declare function getCss(entryPoint: string, options?: InlineBundleOptions): Promise<string>;
declare function getJs(entryPoint: string, options?: InlineBundleOptions): Promise<string>;

export { getCss, getJs };
