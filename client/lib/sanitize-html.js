/** @type {Record<string, Set<string>>} */
const allowedAttributes = {
	a: new Set(['href', 'target', 'rel']),
	p: new Set(['class']),
};

/**
 * @type {(element: HTMLElement, allowedTags: Set<string>, allowedClassNames: Set<string>) => void}
 */
function clean(element, allowedTags, allowedClassNames) {
	for (const childElement of element.children) {
		cleanChildren(/** @type {HTMLElement} */ (childElement), allowedTags, allowedClassNames);
	}
}

/**
 * @type {(childElement: HTMLElement, allowedTags: Set<string>, allowedClassNames: Set<string>) => void}
 */
function cleanChildren(childElement, allowedTags, allowedClassNames) {
	const tag = childElement.tagName.toLowerCase();

	if (!allowedTags.has(tag)) {
		childElement.replaceWith(...childElement.childNodes);
		return;
	}

	for (const attr of [...childElement.attributes]) {
		if (!allowedAttributes[tag]?.has(attr.name)) {
			childElement.removeAttribute(attr.name);
		}
	}

	if (tag === 'p') {
		for (const className of [...childElement.classList]) {
			if (!allowedClassNames.has(className)) {
				childElement.classList.remove(className);
			}
		}
	}

	clean(childElement, allowedTags, allowedClassNames);
}

/** @type {(html: string, allowedTags: Set<string>, allowedClassNames: Set<string>) => string} */
function sanitizeHTML(html, allowedTags, allowedClassNames) {
	const wrapperElement = document.createElement('div');
	wrapperElement.innerHTML = html;

	clean(wrapperElement, allowedTags, allowedClassNames);

	return wrapperElement.innerHTML;
}

export { clean, cleanChildren, sanitizeHTML };
