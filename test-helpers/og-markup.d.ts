/// <reference path="../types/index.d.ts" />

declare function assertHtmlPrefixIncludes(markup: string, fragment: string): void;

declare function assertSingleOgType(markup: string, expectedType: string): void;

declare function getHtmlPrefixAttribute(markup: string): string;

declare function getOgTypeValues(markup: string): string[];

declare function lintOgMarkup(options: { content: string; log?: (...args: unknown[]) => void; name?: string }): {
	warningCount: number;
};

export { assertHtmlPrefixIncludes, assertSingleOgType, getHtmlPrefixAttribute, getOgTypeValues, lintOgMarkup };
