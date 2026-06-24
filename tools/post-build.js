import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const GITHUB_PAGES_CONFIG = `title: site-core
description: Shared-библиотека для vanilla JS MPA/fullstack consumer-проектов
theme: jekyll-theme-cayman
`;

/** @param {{ root?: string }} [options] */
async function runPostBuild({ root = path.resolve(import.meta.dirname, '..') } = {}) {
	const distDir = path.join(root, 'dist');
	const docsSourceDir = path.join(root, 'docs');
	const readmePath = path.join(root, 'README.md');
	const changelogPath = path.join(root, 'CHANGELOG.md');
	const readme = await readFile(readmePath, 'utf8');

	await mkdir(distDir, { recursive: true });
	await copyFile(changelogPath, path.join(distDir, 'CHANGELOG.md'));
	await writeFile(path.join(distDir, '_config.yml'), GITHUB_PAGES_CONFIG);
	await writeFile(path.join(distDir, 'index.md'), wrapMarkdownWithFrontMatter(readme));

	const docsDistDir = path.join(distDir, 'docs');
	const docFileNames = await readdir(docsSourceDir);
	const markdownFileNames = docFileNames.filter((fileName) => fileName.endsWith('.md'));

	if (markdownFileNames.length > 0) {
		await mkdir(docsDistDir, { recursive: true });

		for (const fileName of markdownFileNames) {
			const docContent = await readFile(path.join(docsSourceDir, fileName), 'utf8');
			await writeFile(path.join(docsDistDir, fileName), wrapMarkdownWithFrontMatter(docContent));
		}
	}
}

/** @param {string} content */
function wrapMarkdownWithFrontMatter(content) {
	return `---\n${GITHUB_PAGES_CONFIG}---\n\n${content}`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
	await runPostBuild();
}

export { runPostBuild };
