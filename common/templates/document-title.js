import { getSiteConfig } from '#core/common/lib/site-config.js';

const DOCUMENT_TITLE_SEPARATOR = ' | ';

/** @type {(parts?: string[]) => string} */
function renderDocumentTitle(parts = []) {
	const segments = parts.filter(Boolean);
	const { projectTitle } = getSiteConfig();

	if (projectTitle) {
		segments.push(projectTitle);
	}

	return segments.join(DOCUMENT_TITLE_SEPARATOR);
}

export { renderDocumentTitle };
