import pkg from '../../package.json' with { type: 'json' };

const SITE_CORE_VERSION = pkg.version;

/** @type {(hostAssetVersion: number) => string} */
function buildAssetQuery(hostAssetVersion) {
	return `?v=${hostAssetVersion}&core=${SITE_CORE_VERSION}`;
}

export { SITE_CORE_VERSION, buildAssetQuery };
