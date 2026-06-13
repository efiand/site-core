declare function clean(element: HTMLElement, allowedTags: Set<string>, allowedClassNames: Set<string>): void;

declare function cleanChildren(
	childElement: HTMLElement,
	allowedTags: Set<string>,
	allowedClassNames: Set<string>,
): void;

declare function sanitizeHTML(html: string, allowedTags: Set<string>, allowedClassNames: Set<string>): string;

export { clean, cleanChildren, sanitizeHTML };
