import { CommanderStatic } from 'commander';

export interface IProgramProvider {
	Init(): CommanderStatic;
}
