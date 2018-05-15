export function GetRepoUrl(repo: RepoSetting): string {
	return `git@github.com:${repo.user}/${repo.repo}.git`;
}
