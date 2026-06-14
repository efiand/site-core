declare function fetchLatestReleaseTag(owner: string, repo: string): Promise<string>;
declare function upgradeGitHubActions(workflowsDir?: string): Promise<void>;

export { fetchLatestReleaseTag, upgradeGitHubActions };
