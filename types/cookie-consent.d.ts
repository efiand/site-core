type CookieConsentSettingsControlOptions = {
	className?: string;
	pathname?: string;
	requestPathname?: string;
};

type CookieConsentShowDelay = {
	showDelayMs: number;
	showDelayMsReducedMotion: number;
};

type CookieConsentConfig = {
	cookieName?: string;
	domain?: string;
	excludePathnamePrefixes?: string[];
	maxAgeSeconds?: number;
	showDelayMs?: number;
	showDelayMsByPathname?: Partial<Record<string, number>>;
	showDelayMsReducedMotionByPathname?: Partial<Record<string, number>>;
	texts?: CookieConsentTexts;
};

type CookieConsentTexts = {
	accept?: string;
	banner?: string;
	privacyLink?: string;
	reject?: string;
	settings?: string;
};

type CookieConsentValue = 'accepted' | 'rejected';
