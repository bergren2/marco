import { injectable, inject } from 'inversify';
import chalk from 'chalk';
import { ReadlineModule } from '../../types/readline';
import { FsModule } from '../../types/fs';
import { PathModule } from '../../types/path';
import { RimrafModule } from '../../types/rimraf';
import { SYMBOLS } from '../symbols';
import { IProgramService } from '../interfaces/program-service.interface';
import { IConfigDirectoryProvider } from '../interfaces/config-directory-provider.interface';
import { IRepoService } from '../interfaces/repo-service.interface';
import { IGitService } from '../interfaces/git-service.interface';

@injectable()
export class ProgramService implements IProgramService {
	private readonly package: any;
	private readonly console: NodeJS.WriteStream;
	private readonly readline: ReadlineModule;
	private readonly fs: FsModule;
	private readonly path: PathModule;
	private readonly rimraf: RimrafModule;
	private readonly configDirectoryProvider: IConfigDirectoryProvider;
	private readonly repoService: IRepoService;
	private readonly git: IGitService;

	constructor(
		@inject(SYMBOLS.PackageJson) packageJson: any,
		@inject(SYMBOLS.Console) console: NodeJS.WriteStream,
		@inject(SYMBOLS.ReadlineModule) readline: ReadlineModule,
		@inject(SYMBOLS.FsModule) fs: FsModule,
		@inject(SYMBOLS.PathModule) path: PathModule,
		@inject(SYMBOLS.RimrafModule) rimraf: RimrafModule,
		@inject(SYMBOLS.ConfigDirectoryProvider) configDirectoryProvider: IConfigDirectoryProvider,
		@inject(SYMBOLS.RepoService) repoService: IRepoService,
		@inject(SYMBOLS.GitService) git: IGitService
	) {
		this.package = packageJson;
		this.console = console;
		this.readline = readline;
		this.fs = fs;
		this.path = path;
		this.rimraf = rimraf;
		this.configDirectoryProvider = configDirectoryProvider;
		this.repoService = repoService;
		this.git = git;
	}

	public get Version(): string {
		return this.package.version;
	}

	public async List(): Promise<void> {
		const repos = await this.repoService.GetRepos();
		if (repos.length > 0) {
			repos.forEach((repoSetting) => {
				this.console.write(`${this.StringifyRepoSetting(repoSetting, true)}\n`);
			});
		}
	}

	public async Add(repoArg: string, base?: string): Promise<void> {
		const repo = ProgramService.ParseRepoArg(repoArg, base);
		if (await this.repoService.AddRepo(repo)) {
			this.console.write(`Added repo '${this.StringifyRepoSetting(repo)}'\n`);
		} else {
			this.console.write(chalk`{yellow Warning}: repo '${this.StringifyRepoSetting(repo)}' already exists\n`);
		}
	}

	public async Update(repoArg: string, base: string): Promise<void> {
		const repoSetting = ProgramService.ParseRepoArg(repoArg, base);
		if (await this.repoService.UpdateRepo(repoSetting)) {
			this.console.write(`Updated repo '${this.StringifyRepoSetting(repoSetting)}' with base branch '${repoSetting.base}'\n`);
		} else {
			this.console.write(chalk`{yellow Warning}: repo '${this.StringifyRepoSetting(repoSetting)}' does not exist\n`);
		}
	}

	public async Remove(repoArg: string): Promise<void> {
		const repoSetting = ProgramService.ParseRepoArg(repoArg);
		if (await this.repoService.RemoveRepo(repoSetting)) {
			this.console.write(`Removed repo '${this.StringifyRepoSetting(repoSetting)}'\n`);
		} else {
			this.console.write(chalk`{yellow Warning}: repo '${this.StringifyRepoSetting(repoSetting)}' does not exist\n`);
		}
	}

	public async Import(config: string): Promise<void> {
		try {
			const repos: RepoSetting[] = this.ParseRepoSettingsJson(config);
			await this.repoService.SetRepos(repos);
			this.console.write('Import successful\n');
		} catch (e) {
			let errorMessage = e.toString();
			if (e instanceof Error) {
				errorMessage = e.message;
			}
			this.console.write(chalk`{redBright Error}: ${errorMessage}\n`);
		}
	}

	public async Export(prettyPrint: boolean | undefined = false) {
		const config = await this.repoService.GetRepos();
		const output = JSON.stringify(config, undefined, prettyPrint ? 4 : 0);
		this.console.write(`${output}\n`);
	}

	public async Execute(): Promise<void> {
		const tempFolderPath = this.fs.mkdtempSync(this.path.resolve(this.configDirectoryProvider.Path, 'temp'));
		const repos = await this.repoService.GetRepos();
		const releases: RepoSetting[] = [];

		try {
			for (let i = 0; i < repos.length; i++) {
				const repo = repos[i];
				this.WriteTempMessage(`Cloning repo ${i + 1}/${repos.length}: '${this.StringifyRepoSetting(repo)}'`);

				const repoPath = await this.git.CloneRepo(repo, tempFolderPath, ['--bare']);
				if (await this.git.HasChanges(repoPath, repo)) {
					releases.push(repo);
				}
			}
		} catch (ex) {
			this.WriteTempMessage('');
			this.console.write(chalk.redBright(ex.toString()));
			releases.splice(0);
		}

		this.WriteTempMessage('');
		this.CleanUpTempFolders();
		releases.forEach((repoSetting) => this.console.write(`${this.StringifyRepoSetting(repoSetting)}\n`));
	}

	private StringifyRepoSetting(repoSetting: RepoSetting, includeBase: boolean = false): string {
		return chalk`${repoSetting.user}{gray /}${repoSetting.repo}{gray ${includeBase ? ` [${repoSetting.base}]` : ''}}`;
	}

	private ParseRepoSettingsJson(json: string): RepoSetting[] {
		const repos: RepoSetting[] = JSON.parse(json);
		if (!Array.isArray(repos)) {
			throw new Error('Parsed JSON is not an array');
		} else if (repos.some((repo) => ['user', 'repo', 'base'].some((key) => !(repo as object).hasOwnProperty(key)))) {
			throw new Error('Invalid RepoSetting object');
		}

		return repos;
	}

	private static ParseRepoArg(repoArg: string, base: string = 'master'): RepoSetting {
		const [user, ...repoParts] = repoArg.split('/');
		const repo = repoParts.join('/');
		return { user, repo, base };
	}

	private WriteTempMessage(message: string): void {
		this.readline.clearLine(this.console, -1);
		this.readline.cursorTo(this.console, 0);
		this.console.write(message);
	}

	private CleanUpTempFolders(): void {
		const files = this.fs.readdirSync(this.configDirectoryProvider.Path);
		for (const file of files) {
			if (/^temp.+/.test(file)) {
				this.rimraf.sync(this.path.resolve(this.configDirectoryProvider.Path, file));
			}
		}
	}
}
