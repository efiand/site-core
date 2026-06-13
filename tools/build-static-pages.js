import { access, mkdir, writeFile } from 'node:fs/promises';
import { minifySitemap } from '#core/common/lib/minify-sitemap.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';
import { closeApp, getAppHost, waitForApp } from '#core/server/lib/http-server.js';
import { minifyHtml } from '#core/server/lib/minify-html.js';

/**
 * Статическая генерация HTML через running dev-server.
 *
 * @param {BuildStaticPagesOptions} options
 * @returns {BuildStaticPagesResult} Число успешно записанных страниц.
 */
async function buildStaticPages({ createApp, onPageBuilt = logPageBuilt }) {
	const { buildPages } = getSiteConfig();
	const server = createApp({ isQuiet: true });
	let completedPages = 0;

	try {
		await waitForApp(server);
		const host = getAppHost(server);

		for (const url of buildPages) {
			const markup = await fetch(`${host}${url}`).then((res) => res.text());

			if (url === '/sitemap.xml') {
				await writeFile('./public/sitemap.xml', minifySitemap(markup));
			} else if (url === '/') {
				await writeFile('./public/index.html', await minifyHtml(markup));
			} else if (url === '/404.html') {
				await writeFile('./public/404.html', await minifyHtml(markup));
			} else {
				const publicDir = url.startsWith('/__') ? 'app' : 'public';
				const dir = `./${publicDir}${url}`;

				try {
					await access(dir);
				} catch {
					await mkdir(dir, { recursive: true });
				}

				await writeFile(`${dir}/index.html`, await minifyHtml(markup));
			}

			onPageBuilt?.(url);
			completedPages++;
		}
	} finally {
		await closeApp(server);
	}

	console.info(`✅ Всего сгенерировано страниц: ${completedPages}`);

	return completedPages;
}

/** @type {(url: string) => void} */
function logPageBuilt(url) {
	console.info(`Страница ${url} сгенерирована.`);
}

export { buildStaticPages };
