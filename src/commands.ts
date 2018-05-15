import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';
import program from 'commander';
import rmdir from 'rimraf';
import * as Settings from './services/settings.service';
import * as GitHelpers from './services/git.service';

program
    .version(require('../package.json').version, '-v, --version');

program
    .command('init')
    .description('Initialize user settings')
    .option('-f, --force', 'Force reinitialization')
    .action(async (args: any) => {
        await initialize(args.force);
    });

program
    .command('list')
    .description('List all repositories')
    .action(async () => {
        if (Settings.IsFirstRun()) {
            await initialize();
        }

        const repos = Settings.GetRepos();
        if (repos.length > 0) {
            repos.forEach((repoSetting) => console.log(`${repoSetting.user}/${repoSetting.repo} [${repoSetting.base}]`));
        }
    });

program
    .command('add <user>/<repo> [base]')
    .description('Add a repository')
    .action(async (repoArg: string, base: string) => {
        if (Settings.IsFirstRun()) {
            await initialize();
        }

        const repo = parseRepoArg(repoArg, base);
        if (await Settings.AddRepo(repo)) {
            console.log(`Added repo '${repo.user}/${repo.repo}'`);
        } else {
            console.warn(`Warning: repo '${repo.user}/${repo.repo}' already exists`);
        }
    });

program
    .command('update <user>/<repo> <base>')
    .description('Update a repository\'s base branch')
    .action(async (repoArg: string, base: string) => {
        if (Settings.IsFirstRun()) {
            await initialize();
        }

        const repoSetting = parseRepoArg(repoArg, base);
        if (await Settings.UpdateRepo(repoSetting)) {
            console.log(`Updated repo '${repoSetting.user}/${repoSetting.repo}' with base branch '${repoSetting.base}'`);
        } else {
            console.warn(`Warning: repo '${repoSetting.user}/${repoSetting.repo}' does not exist`);
        }
    });

program
    .command('remove <user>/<repo>')
    .description('Remove a repository')
    .action(async (repoArg: string) => {
        if (Settings.IsFirstRun()) {
            await initialize();
        }

        const repoSetting = parseRepoArg(repoArg);
        if (await Settings.RemoveRepo(repoSetting)) {
            console.log(`Removed repo '${repoSetting.user}/${repoSetting.repo}'`);
        } else {
            console.warn(`Warning: repo '${repoSetting.user}/${repoSetting.repo}' does not exist`);
        }
    });

program
    .command('polo')
    .description('Fetches release information')
    .action(async () => {
        if (Settings.IsFirstRun()) {
            await initialize();
        }

        const tempFolderPath = fs.mkdtempSync(`${Settings.Directory}/temp`);
        const repos = Settings.GetRepos();
        const releases: RepoSetting[] = [];

        try {
            for (let i = 0; i < repos.length; i++) {
                const repo = repos[i];
                writeTempMessage(`Cloning repo ${i + 1}/${repos.length}: '${repo.user}/${repo.repo}'`);

                const repoPath = await GitHelpers.CloneRepo(repo, tempFolderPath, [ '--bare' ]);
                if (await GitHelpers.HasChanges(repoPath, repo)) {
                    releases.push(repo);
                }
            }
        } catch(ex) {
            releases.splice(0);
        }

        writeTempMessage('');
        cleanUpTempFolders();
        releases.forEach((repoSetting) => console.log(`${repoSetting.user}/${repoSetting.repo}`));
    });

async function initialize(force: boolean = false): Promise<void> {
    if (force || Settings.IsFirstRun()) {
        if (force) {
            process.stdout.write('Reinitializing settings...');
        } else {
            process.stdout.write('First run detected. Initializing settings...');
        }
        await Settings.Init();
        process.stdout.write('Done\n');
    } else {
        console.log('Settings already initialized');
    }
}

function parseRepoArg(repoArg: string, base: string = 'master'): RepoSetting {
    const [ user, ...repoParts ] = repoArg.split('/');
    const repo = repoParts.join('/');
    return { user, repo, base };
}

function writeTempMessage(message: string): void {
    readline.clearLine(process.stdout, -1);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(message);
}

function cleanUpTempFolders(): void {
    const files = fs.readdirSync(Settings.Directory);
    for (const file of files) {
        if (/^temp.+/.test(file)) {
            rmdir.sync(path.resolve(Settings.Directory, file));
        }
    }
}

// if no commands were sent, show the program usage
if (process.argv.length === 2) {
    program.help()
}

export default program;
