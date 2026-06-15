import assert from 'node:assert/strict';
import { after, describe, mock, test } from 'node:test';
import { shuffleArray } from '#core/common/lib/shuffle-array.js';

describe('Общее/Shuffle-array', () => {
	after(() => {
		mock.restoreAll();
	});

	test('Перемешивает массив на месте, сохраняя длину и элементы', () => {
		mock.method(Math, 'random', () => 0);

		const items = ['a', 'b', 'c', 'd'];
		const originalItems = [...items];

		shuffleArray(items);

		assert.strictEqual(items.length, originalItems.length);
		assert.deepEqual([...items].sort(), [...originalItems].sort());
	});

	test('Меняет порядок при разных значениях random', () => {
		let call = 0;
		mock.method(Math, 'random', () => {
			call++;
			return call === 1 ? 0.99 : 0;
		});

		const items = [1, 2, 3, 4, 5];
		shuffleArray(items);

		assert.notDeepEqual(items, [1, 2, 3, 4, 5]);
	});

	test('Обрабатывает пустой массив', () => {
		/** @type {number[]} */
		const items = [];
		shuffleArray(items);
		assert.deepEqual(items, []);
	});
});
