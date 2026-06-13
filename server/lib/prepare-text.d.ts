declare function prepareAndMinifyHtml(html: string, clearTags?: boolean): Promise<string>;

declare function prepareText(html: string, clearTags?: boolean): string;

export { prepareAndMinifyHtml, prepareText };
