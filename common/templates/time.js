/// <reference path="../../types/index.d.ts" />

import { normalizeDatetime } from '#core/common/lib/normalize-datetime.js';

const DATE_DISPLAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

/** @type {(date: SiteDatetimeInput) => string} */
function formatDateDisplay(date) {
	const match = DATE_DISPLAY_PATTERN.exec(date.trim());

	if (!match) {
		return date.trim();
	}

	const [, year, month, day] = match;

	return `${day}.${month}.${year}`;
}

/**
 * Рендерит `<time>`: `datetime` из `date` (`SiteDatetimeInput`), текст — `text` или `DD.MM.YYYY` от даты.
 *
 * @type {(options?: RenderTimeTagOptions) => string}
 */
function renderTimeTag({ className, date = null, text = '' } = {}) {
	const dateValue = date?.trim() ?? '';
	const textValue = text.trim();

	if (!dateValue && !textValue) {
		return '';
	}

	const datetime = dateValue ? normalizeDatetime(dateValue) : '';
	const content = textValue || (dateValue ? formatDateDisplay(dateValue) : '');

	if (!datetime && !content) {
		return '';
	}

	const classAttribute = className ? ` class="${className}"` : '';
	const datetimeAttribute = datetime ? ` datetime="${datetime}"` : '';

	return /* html */ `<time${classAttribute}${datetimeAttribute}>${content}</time>`;
}

export { renderTimeTag };
