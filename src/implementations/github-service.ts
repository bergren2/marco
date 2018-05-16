import { injectable } from 'inversify';
import { IGithubService } from '../interfaces/github-service.interface';

@injectable()
export class GithubService implements IGithubService {
	public GetRepoUrl(repo: RepoSetting): string {
		return `git@github.com:${repo.user}/${repo.repo}.git`;
	}
}
