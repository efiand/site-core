/// <reference path="../../types/index.d.ts" />

import { getSiteConfig } from '#core/common/lib/site-config.js';

/** @type {(params: EmailParams) => string} */
function getEmailLink({ body, email = getSiteConfig().email, subject }) {
	if (!email) {
		throw new Error('getEmailLink: email is required');
	}

	const params = new URLSearchParams({ subject });
	if (body) {
		params.set('body', body);
	}
	return `mailto:${email}?${params.toString().replace(/\+/g, '%20')}`;
}

export { getEmailLink };
