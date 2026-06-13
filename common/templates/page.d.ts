/// <reference path="../../types/index.d.ts" />

declare function createRenderPage(options: CreateRenderPageOptions): (data: LayoutData) => Promise<string>;

export { createRenderPage };
