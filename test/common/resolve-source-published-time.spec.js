import assert from 'node:assert/strict';
import { mkdir, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { resolveSourcePublishedTime } from '#core/common/lib/resolve-source-published-time.js';
import { setSiteConfig } from '#core/common/lib/site-config.js';

describe('Общее/resolve-source-published-time', () => {
	/** @type {string} */
	let tempDir = '';

	beforeEach(async () => {
		tempDir = join(tmpdir(), `resolve-source-published-time-${Date.now()}`);
		await mkdir(tempDir, { recursive: true });
		delete process.env.DEV;
		setSiteConfig({ pubDate: '2026-06-14T00:00:00.000Z' });
	});

	afterEach(() => {
		delete process.env.DEV;
		setSiteConfig({ pubDate: '' });
	});

	test('В dev возвращает fallback без stat', async () => {
		process.env.DEV = '1';
		setSiteConfig({ pubDate: '2026-06-14T00:00:00.000Z' });
		const sourcePath = join(tempDir, 'missing.html');
		const result = await resolveSourcePublishedTime({ fallback: '2026-06-14T00:00:00.000Z', sourcePath });

		delete process.env.DEV;
		assert.equal(result, '2026-06-14T00:00:00.000Z');
	});

	test('В prod берёт mtime HTML-файла', async () => {
		const sourcePath = join(tempDir, 'mad-1.html');
		const mtime = new Date('2026-05-01T12:00:00.000Z');

		await writeFile(sourcePath, '<p>test</p>');
		await utimes(sourcePath, mtime, mtime);

		const result = await resolveSourcePublishedTime({
			fallback: '2026-06-14T00:00:00.000Z',
			sourcePath,
		});

		assert.equal(result, mtime.toISOString());
	});

	test('При отсутствии файла возвращает fallback', async () => {
		const result = await resolveSourcePublishedTime({
			fallback: '2026-06-14T00:00:00.000Z',
			sourcePath: join(tempDir, 'missing.html'),
		});

		assert.equal(result, '2026-06-14T00:00:00.000Z');
	});
});
