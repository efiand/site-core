import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { parseConsentCookie } from '#core/client/lib/cookie-consent-storage.js';
import {
	COOKIE_CONSENT_COOKIE_NAME,
	COOKIE_CONSENT_VALUE_ACCEPTED,
} from '#core/common/lib/cookie-consent-constants.js';

describe('Клиент/cookie-consent-storage', () => {
	test('parseConsentCookie читает accepted и rejected', () => {
		const cookieHeader = `${COOKIE_CONSENT_COOKIE_NAME}=${COOKIE_CONSENT_VALUE_ACCEPTED}; other=1`;

		assert.equal(parseConsentCookie(cookieHeader, COOKIE_CONSENT_COOKIE_NAME), COOKIE_CONSENT_VALUE_ACCEPTED);
		assert.equal(parseConsentCookie('site-core-cookie-consent=rejected', COOKIE_CONSENT_COOKIE_NAME), 'rejected');
		assert.equal(parseConsentCookie('other=1', COOKIE_CONSENT_COOKIE_NAME), undefined);
		assert.equal(parseConsentCookie('site-core-cookie-consent=unknown', COOKIE_CONSENT_COOKIE_NAME), undefined);
	});
});
