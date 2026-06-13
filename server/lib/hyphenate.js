/** @type {import('hyphen/ru/index.js').Hyphenator?} */
let runRu = null;

async function hyphenateRu(text = '') {
	if (!runRu) {
		runRu = (await import('hyphen/ru/index.js')).default.hyphenate;
	}
	return await runRu(text);
}

export { hyphenateRu };
