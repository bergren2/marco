import 'reflect-metadata';
import { container } from './container';
import { IProgramProvider } from './interfaces/program-provider.interface';
import { TYPES } from './symbols';

const program = container.get<IProgramProvider>(TYPES.Program).Init();

if (process.argv.length === 2) {
	program.help();
}

export default program;
