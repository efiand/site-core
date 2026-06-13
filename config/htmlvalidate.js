import { defineConfig } from 'html-validate';

const htmlvalidateConfig = defineConfig({
	extends: ['html-validate:recommended', 'html-validate:document'],
	rules: {
		'long-title': 'off',
		'no-inline-style': ['error', { allowedProperties: ['background-image'] }],
		'no-trailing-whitespace': 'off',
		'require-sri': 'off',
	},
});

export { htmlvalidateConfig };
