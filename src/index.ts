import 'reflect-metadata';
import program from 'commander';
import { container } from './container';
import { IProgramProvider } from './interfaces/program-provider.interface';
import { TYPES } from './symbols';

const programProvider = container.get<IProgramProvider>(TYPES.ProgramProvider);

(function configure() {
	program
		.option('--no-color', 'Disable colorized output')
		.version(programProvider.Version, '-v, --version');

	program
		.command('init')
		.description('Initialize user settings')
		.option('-f, --force', 'Force reinitialization')
		.action(async (args: any) => await programProvider.Init(args.force));

	program
		.command('list')
		.description('List all repositories')
		.action(async () => await programProvider.List());

	program
		.command('add <user>/<repo> [base]')
		.description('Add a repository')
		.action(async (repoArg: string, base: string) => await programProvider.Add(repoArg, base));

	program
		.command('update <user>/<repo> <base>')
		.description('Update a repository\'s base branch')
		.action(async (repoArg: string, base: string) => await programProvider.Update(repoArg, base));

	program
		.command('remove <user>/<repo>')
		.description('Remove a repository')
		.action(async (repoArg: string) => await programProvider.Remove(repoArg));

	program
		.command('polo')
		.description('Fetches release information')
		.action(async () => await programProvider.Execute());
})();

if (process.argv.length === 2) {
	program.help();
}

export default program;
