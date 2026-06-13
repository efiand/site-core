/// <reference path="../../types/index.d.ts" />

declare function loadScript(src: string, options?: LoadScriptOptions): Promise<HTMLScriptElement>;

export { loadScript };
