import { expect } from 'chai';
import { Mock } from 'typemoq';
import commander from 'commander';
import { ProgramProvider } from '../../src/implementations/program-provider';
import { ReadlineModule } from '../../types/readline';
import { FsModule } from '../../types/fs';
import { PathModule } from '../../types/path';
import { RimrafModule } from '../../types/rimraf';
import { ISettingsProvider } from '../../src/interfaces/settings-provider.interface';
import { IGitService } from '../../src/interfaces/git-service.interface';

describe('ProgramProvider', () => {
	describe('Init', () => {
		it('should return an instance of Command', () => {
			// Arrange
			const packageMock = Mock.ofType<any>();
			const consoleMock = Mock.ofType<NodeJS.WriteStream>();
			const readlineMock = Mock.ofType<ReadlineModule>();
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const rimrafMock = Mock.ofType<RimrafModule>();
			const settingsMock = Mock.ofType<ISettingsProvider>();
			const gitMock = Mock.ofType<IGitService>();

			const program = new ProgramProvider(
				packageMock.object,
				consoleMock.object,
				readlineMock.object,
				fsMock.object,
				pathMock.object,
				rimrafMock.object,
				settingsMock.object,
				gitMock.object
			);

			// Act
			const result = program.Init();

			// Assert
			expect(result).to.be.an.instanceOf(commander.Command);
		});
	});
});
