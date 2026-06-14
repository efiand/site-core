import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { normalizeDatetime } from '#core/common/lib/normalize-datetime.js';

describe('Общее/normalize-datetime', () => {
	test('normalizeDatetime сохраняет date-only YYYY-MM-DD', () => {
		assert.equal(normalizeDatetime('2026-06-09'), '2026-06-09');
	});

	test('normalizeDatetime сохраняет полный ISO', () => {
		assert.equal(normalizeDatetime('2026-06-09T12:00:00.000Z'), '2026-06-09T12:00:00.000Z');
	});

	test('normalizeDatetime нормализует формат БД', () => {
		assert.equal(normalizeDatetime('2026-06-09 14:30:00'), '2026-06-09T14:30:00');
	});
});
