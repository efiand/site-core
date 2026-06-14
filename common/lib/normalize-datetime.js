/// <reference path="../../types/index.d.ts" />

const DATE_DISPLAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME_PATTERN = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)(Z|[+-]\d{2}:\d{2})?$/;

/**
 * Нормализует дату/время для `datetime`, sitemap `lastmod` и др.: date-only → `YYYY-MM-DD`, иначе ISO `…T…`.
 *
 * @type {(value: SiteDatetimeInput) => string}
 */
function normalizeDatetime(value) {
	const trimmed = value.trim();

	if (DATE_ONLY_PATTERN.test(trimmed)) {
		return trimmed;
	}

	const isoMatch = ISO_DATETIME_PATTERN.exec(trimmed);

	if (isoMatch) {
		const [, datePart, timePart, zone = ''] = isoMatch;

		return `${datePart}T${timePart}${zone}`;
	}

	const dateMatch = DATE_DISPLAY_PATTERN.exec(trimmed);

	return dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';
}

export { normalizeDatetime };
