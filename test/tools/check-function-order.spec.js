import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import {
	checkFileFunctionBlankLines,
	checkFileFunctionOrder,
	checkFileJsdocFormatting,
	checkFunctionOrder,
	getTopLevelFunctionNames,
	getTopLevelFunctions,
} from '../../tools/check-function-order.js';

describe('Инструменты/check-function-order', () => {
	/** @type {string} */
	let tempRoot;

	before(() => {
		tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-core-function-order-'));
	});

	after(() => {
		fs.rmSync(tempRoot, { force: true, recursive: true });
	});

	it('getTopLevelFunctionNames игнорирует вложенные function', () => {
		const names = getTopLevelFunctionNames(`
function zebra() {
	function nested() {}
	return function inner() {};
}

async function alpha() {}
`);

		assert.deepEqual(names, ['zebra', 'alpha']);
	});

	it('checkFileFunctionOrder null для одной функции', () => {
		const filePath = 'single.js';
		fs.writeFileSync(path.join(tempRoot, filePath), 'function only() {}\n');

		assert.strictEqual(checkFileFunctionOrder(filePath, tempRoot), null);
	});

	it('checkFileFunctionOrder null для алфавитного порядка', () => {
		const filePath = 'sorted.js';
		fs.writeFileSync(
			path.join(tempRoot, filePath),
			`function alpha() {}\n\nfunction beta() {}\n\nexport { alpha, beta };\n`,
		);

		assert.strictEqual(checkFileFunctionOrder(filePath, tempRoot), null);
	});

	it('checkFileFunctionOrder ловит нарушение порядка', () => {
		const filePath = 'wrong.js';
		fs.writeFileSync(
			path.join(tempRoot, filePath),
			`function zebra() {}\n\nfunction alpha() {}\n\nexport { alpha, zebra };\n`,
		);

		assert.deepEqual(checkFileFunctionOrder(filePath, tempRoot), {
			expected: ['alpha', 'zebra'],
			file: filePath,
			names: ['zebra', 'alpha'],
		});
	});

	it('checkFunctionOrder пропускает tmp и node_modules', () => {
		const scanRoot = path.join(tempRoot, 'scan');
		fs.mkdirSync(path.join(scanRoot, 'tmp'), { recursive: true });
		fs.mkdirSync(path.join(scanRoot, 'node_modules', 'pkg'), { recursive: true });
		fs.writeFileSync(path.join(scanRoot, 'ok.js'), 'function alpha() {}\n\nfunction beta() {}\n');
		fs.writeFileSync(path.join(scanRoot, 'tmp', 'bad.js'), 'function zebra() {}\n\nfunction alpha() {}\n');
		fs.writeFileSync(
			path.join(scanRoot, 'node_modules', 'pkg', 'bad.js'),
			'function zebra() {}\n\nfunction alpha() {}\n',
		);

		assert.deepEqual(checkFunctionOrder(scanRoot), []);
	});

	it('checkFileFunctionBlankLines null при пустой строке между функциями', () => {
		const filePath = 'spaced.js';
		fs.writeFileSync(path.join(tempRoot, filePath), `function alpha() {}\n\nfunction beta() {}\n`);

		assert.deepEqual(checkFileFunctionBlankLines(filePath, tempRoot), []);
	});

	it('checkFileFunctionBlankLines ловит отсутствие пустой строки', () => {
		const filePath = 'tight.js';
		fs.writeFileSync(path.join(tempRoot, filePath), `function alpha() {}\nfunction beta() {}\n`);

		assert.deepEqual(checkFileFunctionBlankLines(filePath, tempRoot), [
			{ after: 'beta', before: 'alpha', file: filePath },
		]);
	});

	it('findFunctionBlockStart берёт только JSDoc непосредственно перед function', () => {
		const source = `/** @type {Record<string, string>} */
const ITEMS = {};

/**
 * @param {string} name
 */
function first() {}

/** @type {() => void} */
function second() {}
`;
		const functions = getTopLevelFunctions(source);

		assert.strictEqual(functions[0].name, 'first');
		assert.ok(source.slice(functions[0].blockStart, functions[0].blockStart + 3) === '/**');
		assert.notStrictEqual(functions[0].blockStart, source.indexOf('/** @type {Record'));
		assert.strictEqual(functions[1].name, 'second');
		assert.ok(source.slice(functions[1].blockStart).startsWith('/** @type'));
	});

	it('getTopLevelFunctions находит function с многострочными параметрами', () => {
		const source = `function initService({
\tapiKey,
\thost,
}) {
\treturn { apiKey, host };
}

function trackEvent() {}
`;
		const functions = getTopLevelFunctions(source);

		assert.deepEqual(
			functions.map(({ name }) => name),
			['initService', 'trackEvent'],
		);
		assert.ok(functions[0].bodyEnd > functions[0].blockStart);
		assert.ok(functions[0].bodyEnd < functions[1].blockStart);
	});

	it('getTopLevelFunctions находит function с деструктуризацией и = {}', () => {
		const source = fs.readFileSync(path.join(process.cwd(), 'client/lib/init-yandex-metrika.js'), 'utf8');
		const functions = getTopLevelFunctions(source);

		assert.deepEqual(
			functions.map(({ name }) => name),
			['initYandexMetrika', 'trackPageView'],
		);
		assert.deepEqual(checkFileFunctionBlankLines('client/lib/init-yandex-metrika.js', process.cwd()), []);
	});

	it('checkFileJsdocFormatting ловит разорванный /** @type и пустую строку перед */', () => {
		const splitType = 'broken-split.js';
		fs.writeFileSync(path.join(tempRoot, splitType), `/** @type {() => void}\n */\nfunction alpha() {}\n`);

		assert.deepEqual(checkFileJsdocFormatting(splitType, tempRoot), [
			{
				file: splitType,
				line: 1,
				message: 'JSDoc @type must close on the same line ( */ ), not on the next line',
			},
		]);

		const blankBeforeClose = 'broken-blank.js';
		fs.writeFileSync(path.join(tempRoot, blankBeforeClose), `/**\n * @type {() => void}\n\n */\nfunction beta() {}\n`);

		assert.deepEqual(checkFileJsdocFormatting(blankBeforeClose, tempRoot), [
			{
				file: blankBeforeClose,
				line: 3,
				message: 'Remove the blank line before */ inside JSDoc',
			},
		]);
	});
});
