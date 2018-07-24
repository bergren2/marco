import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { Container } from 'inversify';
import SimpleGit from 'simple-git';
import rimraf from 'rimraf';
import { SYMBOLS } from './symbols';
import { FsModule } from '../types/fs';
import { PathModule } from '../types/path';
import { ReadlineModule } from '../types/readline';
import { RimrafModule } from '../types/rimraf';
import { IGitService } from './interfaces/git-service.interface';
import { GitService } from './services/git-service';
import { IGithubService } from './interfaces/github-service.interface';
import { GithubService } from './services/github-service';
import { IConfigDirectoryProvider } from './interfaces/config-directory-provider.interface';
import { ConfigDirectoryProvider } from './providers/config-directory-provider';
import { IConfigProvider } from './interfaces/config-provider.interface';
import { ConfigProvider } from './providers/config-provider';
import { IRepoService } from './interfaces/repo-service.interface';
import { RepoService } from './services/repo-service';
import { IProgramService } from './interfaces/program-service.interface';
import { ProgramService } from './services/program-service';

const container = new Container();

// External Dependencies
container.bind<object>(SYMBOLS.PackageJson).toConstantValue(require('../package.json'));
container.bind<FsModule>(SYMBOLS.FsModule).toConstantValue(fs);
container.bind<PathModule>(SYMBOLS.PathModule).toConstantValue(path);
container.bind<ReadlineModule>(SYMBOLS.ReadlineModule).toConstantValue(readline);
container.bind<NodeJS.WriteStream>(SYMBOLS.Console).toConstantValue(process.stdout);
container.bind<SimpleGitStatic>(SYMBOLS.SimpleGit).toConstantValue(SimpleGit);
container.bind<RimrafModule>(SYMBOLS.RimrafModule).toConstantValue(rimraf);

// Internal Dependencies
container.bind<IGitService>(SYMBOLS.GitService).to(GitService);
container.bind<IGithubService>(SYMBOLS.GithubService).to(GithubService);
container.bind<IConfigDirectoryProvider>(SYMBOLS.ConfigDirectoryProvider).to(ConfigDirectoryProvider);
container.bind<IConfigProvider>(SYMBOLS.ConfigProvider).to(ConfigProvider);
container.bind<IRepoService>(SYMBOLS.RepoService).to(RepoService);
container.bind<IProgramService>(SYMBOLS.ProgramService).to(ProgramService);

export { container };
