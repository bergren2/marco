import { expect } from 'chai';
import { Mock, It } from 'typemoq';
import { IGithubService } from '../../src/interfaces/github-service.interface';
import { GitService } from '../../src/implementations/git-service';

describe('GitService', () => {
	describe('CloneRepo', () => {
		it('should return a string', async () => {
			// Arrange
			const simpleGitMock = Mock.ofType<SimpleGitStatic>();
			const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
			const githubServiceMock = Mock.ofType<IGithubService>();
			const repoSetting: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };
			const destination = '/some/folder';

			simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

			simpleGitInstanceMock
				.setup((x) => x.clone(It.isAnyString(), It.isAny(), It.isAny()))
				.callback((_url, _options, cb) => cb())
				.returns(() => Promise.resolve());

			githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

			const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

			// Act
			const repoLocation = await gitService.CloneRepo(repoSetting, destination);

			// Assert
			expect(repoLocation).to.be.a('string');
		});

		it('should return a string in the format \'<destination>/<repo>.git\'', async () => {
			// Arrange
			const simpleGitMock = Mock.ofType<SimpleGitStatic>();
			const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
			const githubServiceMock = Mock.ofType<IGithubService>();
			const repoSetting: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };
			const destination = '/some/folder';

			simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

			simpleGitInstanceMock
				.setup((x) => x.clone(It.isAnyString(), It.isAny(), It.isAny()))
				.callback((_url, _options, cb) => cb())
				.returns(() => Promise.resolve());

			githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

			const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

			// Act
			const repoLocation = await gitService.CloneRepo(repoSetting, destination);

			// Assert
			expect(repoLocation).to.equal(`/some/folder/repo.git`);
		});
	});
});
