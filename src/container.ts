import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { Container } from 'inversify';
import SimpleGit from 'simple-git';
import rimraf from 'rimraf';
import { TYPES } from './symbols';
import { FsModule } from '../types/fs';
import { PathModule } from '../types/path';
import { ReadlineModule } from '../types/readline';
import { RimrafModule } from '../types/rimraf';
import { IGitService } from './interfaces/git-service.interface';
import { GitService } from './implementations/git-service';
import { IGithubService } from './interfaces/github-service.interface';
import { GithubService } from './implementations/github-service';
import { ISettingsProvider } from './interfaces/settings-provider.interface';
import { SettingsProvider } from './implementations/settings-provider';
import { IProgramProvider } from './interfaces/program-provider.interface';
import { ProgramProvider } from './implementations/program-provider';

const container = new Container();

// External Dependencies
container.bind<object>(TYPES.PackageJson).toConstantValue(require('../package.json'));
container.bind<FsModule>(TYPES.FsModule).toConstantValue(fs);
container.bind<PathModule>(TYPES.PathModule).toConstantValue(path);
container.bind<ReadlineModule>(TYPES.ReadlineModule).toConstantValue(readline);
container.bind<NodeJS.WriteStream>(TYPES.Console).toConstantValue(process.stdout);
container.bind<SimpleGitStatic>(TYPES.SimpleGit).toConstantValue(SimpleGit);
container.bind<RimrafModule>(TYPES.RimrafModule).toConstantValue(rimraf);

// Internal Dependencies
container.bind<IGitService>(TYPES.GitService).to(GitService);
container.bind<IGithubService>(TYPES.GithubService).to(GithubService);
container.bind<ISettingsProvider>(TYPES.SettingsProvider).to(SettingsProvider);
container.bind<IProgramProvider>(TYPES.Program).to(ProgramProvider);

export { container };
