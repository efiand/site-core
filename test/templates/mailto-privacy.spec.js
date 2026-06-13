import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { setSiteConfig } from '#core/common/lib/site-config.js';
import {
	DEFAULT_MAILTO_CONTACT_LABEL,
	PRIVACY_MAILTO_CONSENT,
	renderMailtoContactWithPrivacy,
} from '#core/common/templates/mailto-privacy.js';

describe('Общее/mailto-privacy', () => {
	beforeEach(() => {
		setSiteConfig({ email: 'test@example.com' });
	});

	afterEach(() => {
		setSiteConfig({ email: '', routes: {} });
	});

	test('PRIVACY_MAILTO_CONSENT ссылается на /privacy', () => {
		assert.match(PRIVACY_MAILTO_CONSENT, /href="\/privacy"/);
		assert.match(PRIVACY_MAILTO_CONSENT, /соглашаетесь с <a/);
		assert.match(PRIVACY_MAILTO_CONSENT, /Отправляя письмо, вы соглашаетесь/);
	});

	test('renderMailtoContactWithPrivacy собирает mailto из subject с дефолтной подписью', () => {
		const markup = renderMailtoContactWithPrivacy({ subject: 'Hello' });

		assert.match(markup, /href="mailto:test@example.com\?subject=Hello"/);
		assert.match(markup, new RegExp(DEFAULT_MAILTO_CONTACT_LABEL));
		assert.match(markup, /href="\/privacy"/);
	});

	test('renderMailtoContactWithPrivacy поддерживает кастомную подпись', () => {
		const markup = renderMailtoContactWithPrivacy({
			contactLabel: 'Написать',
			subject: 'Hello',
		});

		assert.match(markup, />Написать</);
	});
});
