import { injectable, inject } from 'inversify';
import { IRepoService } from '../interfaces/repo-service.interface';
import { IConfigProvider } from '../interfaces/config-provider.interface';
import { SYMBOLS } from '../symbols';

@injectable()
export class RepoService implements IRepoService {
	private readonly configProvider: IConfigProvider;

	constructor(@inject(SYMBOLS.ConfigProvider) configProvider: IConfigProvider) {
		this.configProvider = configProvider;
	}

	public async GetRepos(): Promise<RepoSetting[]> {
		const config = await this.configProvider.Get();
		return [...config.repos];
	}

	public async AddRepo(repo: RepoSetting): Promise<boolean> {
		const repos = await this.GetRepos();
		if (!repos.some((r) => r.user === repo.user && r.repo === repo.repo)) {
			repos.push(repo);
			repos.sort((a, b) => `${a.user}/${a.repo}`.localeCompare(`${b.user}/${b.repo}`));
			await this.configProvider.Set({ repos });
			return true;
		}
		return false;
	}

	public async UpdateRepo(repo: RepoSetting): Promise<boolean> {
		const repos = await this.GetRepos();
		const target = repos.find((r) => r.user === repo.user && r.repo === repo.repo);
		if (target) {
			target.base = repo.base;
			await this.configProvider.Set({ repos });
			return true;
		}
		return false;
	}

	public async RemoveRepo(repo: RepoSetting): Promise<boolean> {
		const repos = await this.GetRepos();
		const target = repos.find((r) => r.user === repo.user && r.repo === repo.repo);
		if (target) {
			repos.splice(repos.indexOf(target), 1);
			await this.configProvider.Set({ repos });
			return true;
		}
		return false;
	}

	public async SetRepos(repos: RepoSetting[]): Promise<void> {
		await this.configProvider.Set({ repos });
	}
}
