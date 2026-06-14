/// <reference path="../../types/index.d.ts" />

declare function getHtmlPrefixAttribute(markup: string): string;

declare function getMetaPropertyValues(markup: string): Map<string, string[]>;

declare function getOgTypeValues(markup: string): string[];

declare function validateOgMarkup(markup: string): OgMarkupReport;

export { getHtmlPrefixAttribute, getMetaPropertyValues, getOgTypeValues, validateOgMarkup };
