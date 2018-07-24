import 'reflect-metadata';
import program from 'commander';
import { container } from './container';
import { IProgramService } from './interfaces/program-service.interface';
import { SYMBOLS } from './symbols';

const programService = container.get<IProgramService>(SYMBOLS.ProgramService);

(function configure() {
	program
		.option('--no-color', 'Disable colorized output')
		.version(programService.Version, '-v, --version');

	program
		.command('list')
		.description('List all repositories')
		.action(async () => await programService.List());

	program
		.command('add <user>/<repo> [base]')
		.description('Add a repository')
		.action(async (repoArg: string, base: string) => await programService.Add(repoArg, base));

	program
		.command('update <user>/<repo> <base>')
		.description('Update a repository\'s base branch')
		.action(async (repoArg: string, base: string) => await programService.Update(repoArg, base));

	program
		.command('remove <user>/<repo>')
		.description('Remove a repository')
		.action(async (repoArg: string) => await programService.Remove(repoArg));

	program
		.command('import <config>')
		.description('Replace configuration with config from stdin')
		.action(async (repoJson: string) => await programService.Import(repoJson));

	program
		.command('export')
		.description('Write configuration to stdout')
		.option('-p, --pretty', 'Pretty-print config')
		.action(async (args: any) => await programService.Export(args.pretty));

	program
		.command('polo')
		.description('Fetches release information')
		.action(async () => await programService.Execute());
})();

export default program;
