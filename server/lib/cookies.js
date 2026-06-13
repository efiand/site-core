/** @type {(res: RouteResponse, name: string, path?: string) => void} */
function deleteCookie(res, name, path = '/') {
	setCookie(res, { maxAge: 0, name, path, value: '' });
}

/** @type {(req: RouteRequest) => Record<string, string | undefined>} */
function getCookies(req) {
	const cookieHeader = req.headers.cookie;
	if (!cookieHeader) {
		return {};
	}

	return Object.fromEntries(
		cookieHeader.split('; ').map((item) => {
			const [name, ...rest] = item.split('=');
			return [name, rest.join('=')];
		}),
	);
}

/** @type {(res: RouteResponse, body: CookieBody) => void} */
function setCookie(
	res,
	{ domain, expires, httpOnly = true, maxAge, name, path = '/', sameSite = 'Strict', secure = true, value },
) {
	const parts = [`${name}=${value}`];

	if (maxAge) {
		parts.push(`Max-Age=${maxAge}`);
	}
	if (expires) {
		parts.push(`Expires=${expires.toUTCString()}`);
	}
	if (path) {
		parts.push(`Path=${path}`);
	}
	if (domain) {
		parts.push(`Domain=${domain}`);
	}
	if (httpOnly) {
		parts.push(`HttpOnly`);
	}
	if (secure) {
		parts.push(`Secure`);
	}
	if (sameSite) {
		parts.push(`SameSite=${sameSite}`);
	}

	const cookieString = parts.join('; ');

	const existing = /** @type {number | string | readonly string[]}*/ (res.getHeader('Set-Cookie'));
	if (existing) {
		res.setHeader('Set-Cookie', Array.isArray(existing) ? [...existing, cookieString] : [existing, cookieString]);
	} else {
		res.setHeader('Set-Cookie', cookieString);
	}
}

export { deleteCookie, getCookies, setCookie };
