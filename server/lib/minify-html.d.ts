import type { Options } from 'html-minifier-terser';

declare function minifyHtml(html: string, config?: Options): Promise<string>;

export { minifyHtml };
