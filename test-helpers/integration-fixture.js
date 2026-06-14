/// <reference path="../types/index.d.ts" />

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { HtmlValidate } from 'html-validate';
import * as bemLinter from 'posthtml-bem-linter';
import { log } from '#core/common/lib/log.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';
import { closeApp, getAppHost, waitForApp } from '#core/server/lib/http-server.js';
import { lintOgMarkup } from '#core/test-helpers/og-markup.js';
import { htmlvalidateConfig } from '../config/htmlvalidate.js';

const DEFAULT_EXCLUDE_PAGES = ['/sitemap.xml'];

const htmlvalidate = new HtmlValidate(htmlvalidateConfig);

/** @type {({ excludePages?: string[] }) => string[]} */
function getIntegrationBuildPages({ excludePages = DEFAULT_EXCLUDE_PAGES } = {}) {
	const excluded = new Set(excludePages);

	return [...getSiteConfig().buildPages].filter((page) => !excluded.has(page));
}

/** @type {(fixture: IntegrationFixture) => void} */
function registerMarkupValidationTests(fixture) {
	describe('Разметка', () => {
		test('На всех страницах валидные BEM-классы', () => {
			let errorsCount = 0;
			const markups = fixture.getMarkups();

			fixture.allPages.forEach((page, index) => {
				const result = bemLinter.lintBem({ content: markups[index], log: log.error, name: page });
				if (result.warningCount) {
					errorsCount++;
				}
			});

			assert.strictEqual(errorsCount, 0);
		});

		test('На всех страницах валидный HTML', async () => {
			let errorsCount = 0;
			const markups = fixture.getMarkups();

			await Promise.all(
				fixture.allPages.map(async (page, index) => {
					const report = await htmlvalidate.validateString(markups[index]);
					if (!report.valid) {
						errorsCount++;
						report.results.forEach(({ messages }) => {
							messages.forEach(({ column, line, message, ruleUrl }) => {
								log.error(`${page} [${line}:${column}] ${message} (${ruleUrl})`);
							});
						});
					}
				}),
			);

			assert.strictEqual(errorsCount, 0);
		});

		test('На всех страницах валидный Open Graph', () => {
			let errorsCount = 0;
			const markups = fixture.getMarkups();

			fixture.allPages.forEach((page, index) => {
				const result = lintOgMarkup({ content: markups[index], log: log.error, name: page });
				if (result.warningCount) {
					errorsCount++;
				}
			});

			assert.strictEqual(errorsCount, 0);
		});
	});
}

/** @type {(options: UseIntegrationFixtureOptions) => IntegrationFixture} */
function useIntegrationFixture({ createApp, excludePages = DEFAULT_EXCLUDE_PAGES }) {
	const allPages = getIntegrationBuildPages({ excludePages });
	/** @type {string[]} */
	let markups = [];
	/** @type {import('node:http').Server | undefined} */
	let server;

	before(async () => {
		if (!server) {
			server = createApp({ isQuiet: true, port: 0 });
			await waitForApp(server);
		}

		if (!markups.length) {
			markups = await Promise.all(allPages.map((page) => getMarkup(page)));
		}
	});

	after(async () => {
		await closeApp(server);
	});

	/** @type {(page?: string) => Promise<string>} */
	async function getMarkup(page = '') {
		return await fetch(`${getAppHost(server)}${page}`).then((response) => response.text());
	}

	return {
		allPages,
		getMarkup,
		getMarkups: () => markups,
		getServer: () => server,
	};
}

export { getIntegrationBuildPages, registerMarkupValidationTests, useIntegrationFixture };
