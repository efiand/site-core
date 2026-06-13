/// <reference path="../../types/index.d.ts" />

import { getEmailLink } from '#core/common/lib/get-email-link.js';

/** @type {string} */
const PRIVACY_MAILTO_CONSENT = /* html */ `Отправляя письмо, вы соглашаетесь с <a href="/privacy">Политикой обработки персональных данных</a>.`;

/** @type {string} */
const DEFAULT_MAILTO_CONTACT_LABEL = 'Свяжитесь с разработчиком';

/** @type {(options: MailtoContactOptions) => string} */
function renderMailtoContactWithPrivacy({ body, contactLabel = DEFAULT_MAILTO_CONTACT_LABEL, subject }) {
	const emailLink = getEmailLink({ body, subject });

	return /* html */ `<a href="${emailLink}">${contactLabel}</a>. ${PRIVACY_MAILTO_CONSENT}`;
}

export { DEFAULT_MAILTO_CONTACT_LABEL, PRIVACY_MAILTO_CONSENT, renderMailtoContactWithPrivacy };
