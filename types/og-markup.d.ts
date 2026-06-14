type OgMarkupIssueSeverity = 'error' | 'warning';

type OgMarkupIssue = {
	message: string;
	property?: string;
	severity: OgMarkupIssueSeverity;
};

type OgMarkupReport = {
	issues: OgMarkupIssue[];
	valid: boolean;
};
