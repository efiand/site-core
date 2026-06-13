declare const DEFAULT_MAILTO_CONTACT_LABEL: string;
declare const PRIVACY_MAILTO_CONSENT: string;

declare function renderMailtoContactWithPrivacy(options: MailtoContactOptions): string;

export { DEFAULT_MAILTO_CONTACT_LABEL, PRIVACY_MAILTO_CONSENT, renderMailtoContactWithPrivacy };
