import '../support/setup';
import { expect } from 'chai';
import { Mock, It, Times } from 'typemoq';
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

		it('should reject when there was an error cloning the repo', (done) => {
			// Arrange
			const simpleGitMock = Mock.ofType<SimpleGitStatic>();
			const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
			const githubServiceMock = Mock.ofType<IGithubService>();
			const repoSetting: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };
			const destination = '/some/folder';

			simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

			simpleGitInstanceMock
				.setup((x) => x.clone(It.isAnyString(), It.isAny(), It.isAny()))
				.callback((_url, _options, cb) => cb('Error'))
				.returns(() => Promise.resolve());

			githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

			const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

			// Act
			const clonePromise = gitService.CloneRepo(repoSetting, destination);

			// Assert
			expect(clonePromise).to.be.rejected.and.notify(done);
		});

		it('should initialize SimpleGit with the destination', async () => {
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
			await gitService.CloneRepo(repoSetting, destination);

			// Assert
			simpleGitMock.verify((x) => x(It.is((dest) => dest === destination)), Times.once());
		});

		it('should get the Github repo address from GithubService', async () => {
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
			await gitService.CloneRepo(repoSetting, destination);

			// Assert
			githubServiceMock
				.verify((x) => x.GetRepoUrl(It.is((repo) => {
					return repo.user === 'user' &&
						repo.repo === 'repo' &&
						repo.base === 'base';
				})), Times.once());
		});
	});

	describe('GetLatestTag', () => {
		it('should return a string', async () => {
			// Arrange
			const simpleGitMock = Mock.ofType<SimpleGitStatic>();
			const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
			const githubServiceMock = Mock.ofType<IGithubService>();
			const destination = '/some/folder';
			const tagsObject: TagsCollection = {
				latest: '1.0.0',
				all: [
					'1.0.0',
					'0.1.0',
					'0.0.1'
				]
			};

			simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

			simpleGitInstanceMock
				.setup((x) => x.tags(It.isAny()))
				.callback((cb) => cb(null, tagsObject));

			githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

			const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

			// Act
			const tag = await gitService.GetLatestTag(destination);

			// Assert
			expect(tag).to.be.a('string');
		});

		[
			{ tagsObject: { latest: '1.0.0', all: [ '0.0.1', '0.1.0', '1.0.0' ] }, expected: '1.0.0' },
			{ tagsObject: { latest: '1.0.0-rc', all: [ '0.0.1', '0.1.0', '1.0.0-rc' ] }, expected: '0.1.0' },
			{ tagsObject: { latest: 'v1', all: [ '0.0.1', 'v0.1', 'v1' ] }, expected: '0.0.1' }
		]
		.forEach((testConfig) => {
			it(`should return the latest tag following semver (Expected: '${testConfig.expected}')`, async () => {
				// Arrange
				const simpleGitMock = Mock.ofType<SimpleGitStatic>();
				const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
				const githubServiceMock = Mock.ofType<IGithubService>();
				const destination = '/some/folder';

				simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

				simpleGitInstanceMock
					.setup((x) => x.tags(It.isAny()))
					.callback((cb) => cb(null, testConfig.tagsObject));

				githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

				const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

				// Act
				const tag = await gitService.GetLatestTag(destination);

				// Assert
				expect(tag).to.equal(testConfig.expected);
			});
		});

		it('should return an empty string if no tags follow semver', async () => {
			// Arrange
			const simpleGitMock = Mock.ofType<SimpleGitStatic>();
			const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
			const githubServiceMock = Mock.ofType<IGithubService>();
			const destination = '/some/folder';
			const tagsObject: TagsCollection = {
				latest: 'v1',
				all: [
					'v0.1',
					'v1'
				]
			};

			simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

			simpleGitInstanceMock
				.setup((x) => x.tags(It.isAny()))
				.callback((cb) => cb(null, tagsObject));

			githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

			const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

			// Act
			const tag = await gitService.GetLatestTag(destination);

			// Assert
			expect(tag).to.be.a('string').that.is.empty;
		});

		it('should reject if there was an error fetching tags', (done) => {
			// Arrange
			const simpleGitMock = Mock.ofType<SimpleGitStatic>();
			const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
			const githubServiceMock = Mock.ofType<IGithubService>();
			const destination = '/some/folder';

			simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

			simpleGitInstanceMock
				.setup((x) => x.tags(It.isAny()))
				.callback((cb) => cb('Error', null));

			githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

			const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

			// Act
			const tagPromise = gitService.GetLatestTag(destination);

			// Assert
			expect(tagPromise).to.be.rejected.and.notify(done);
		});
	});

	describe('HasChanges', () => {
		it('should return a boolean', async () => {
			// Arrange
			const simpleGitMock = Mock.ofType<SimpleGitStatic>();
			const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
			const githubServiceMock = Mock.ofType<IGithubService>();
			const destination = '/some/folder';

			const repoSetting: RepoSetting = {
				user: 'user',
				repo: 'repo',
				base: 'base'
			};

			const tagsObject: TagsCollection = {
				latest: 'v1',
				all: [
					'v0.1',
					'v1'
				]
			};

			const commitsCollection: ListLogSummary = {
				latest: 'latest commit',
				all: [
					'initial commit',
					'latest commit'
				],
				total: 2
			};

			simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

			simpleGitInstanceMock
				.setup((x) => x.tags(It.isAny()))
				.callback((cb) => cb(null, tagsObject));

			simpleGitInstanceMock
				.setup((x) => x.log(It.isAny(), It.isAny()))
				.callback((_options, cb) => cb(null, commitsCollection));

			githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

			const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

			// Act
			const hasChanges = await gitService.HasChanges(destination, repoSetting);

			// Assert
			expect(hasChanges).to.be.a('boolean');
		});

		it('should return true when log is not empty', async () => {
			// Arrange
			const simpleGitMock = Mock.ofType<SimpleGitStatic>();
			const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
			const githubServiceMock = Mock.ofType<IGithubService>();
			const destination = '/some/folder';

			const repoSetting: RepoSetting = {
				user: 'user',
				repo: 'repo',
				base: 'base'
			};

			const tagsObject: TagsCollection = {
				latest: '1.0.0',
				all: [
					'1.0.0'
				]
			};

			const commitsCollection: ListLogSummary = {
				latest: 'latest commit',
				all: [
					'initial commit',
					'latest commit'
				],
				total: 2
			};

			simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

			simpleGitInstanceMock
				.setup((x) => x.tags(It.isAny()))
				.callback((cb) => cb(null, tagsObject));

			simpleGitInstanceMock
				.setup((x) => x.log(It.isAny(), It.isAny()))
				.callback((_options, cb) => cb(null, commitsCollection));

			githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

			const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

			// Act
			const hasChanges = await gitService.HasChanges(destination, repoSetting);

			// Assert
			expect(hasChanges).to.be.a('boolean').that.is.true;
		});

		it('should return false when log is empty', async () => {
			// Arrange
			const simpleGitMock = Mock.ofType<SimpleGitStatic>();
			const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
			const githubServiceMock = Mock.ofType<IGithubService>();
			const destination = '/some/folder';

			const repoSetting: RepoSetting = {
				user: 'user',
				repo: 'repo',
				base: 'base'
			};

			const tagsObject: TagsCollection = {
				latest: '1.0.0',
				all: [
					'1.0.0'
				]
			};

			const commitsCollection: ListLogSummary = {
				latest: null,
				all: [],
				total: 0
			};

			simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

			simpleGitInstanceMock
				.setup((x) => x.tags(It.isAny()))
				.callback((cb) => cb(null, tagsObject));

			simpleGitInstanceMock
				.setup((x) => x.log(It.isAny(), It.isAny()))
				.callback((_options, cb) => cb(null, commitsCollection));

			githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

			const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

			// Act
			const hasChanges = await gitService.HasChanges(destination, repoSetting);

			// Assert
			expect(hasChanges).to.be.a('boolean').that.is.false;
		});

		it('should return false when latest tag is not valid', async () => {
			// Arrange
			const simpleGitMock = Mock.ofType<SimpleGitStatic>();
			const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
			const githubServiceMock = Mock.ofType<IGithubService>();
			const destination = '/some/folder';

			const repoSetting: RepoSetting = {
				user: 'user',
				repo: 'repo',
				base: 'base'
			};

			const tagsObject: TagsCollection = {
				latest: 'v1',
				all: [
					'v1'
				]
			};

			const commitsCollection: ListLogSummary = {
				latest: 'latest commit',
				all: [
					'initial commit',
					'latest commit'
				],
				total: 2
			};

			simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

			simpleGitInstanceMock
				.setup((x) => x.tags(It.isAny()))
				.callback((cb) => cb(null, tagsObject));

			simpleGitInstanceMock
				.setup((x) => x.log(It.isAny(), It.isAny()))
				.callback((_options, cb) => cb(null, commitsCollection));

			githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

			const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

			// Act
			const hasChanges = await gitService.HasChanges(destination, repoSetting);

			// Assert
			expect(hasChanges).to.be.a('boolean').that.is.false;
		});

		it('should initialize SimpleGit with repo folder path', async () => {
			// Arrange
			const simpleGitMock = Mock.ofType<SimpleGitStatic>();
			const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
			const githubServiceMock = Mock.ofType<IGithubService>();
			const destination = '/some/folder';

			const repoSetting: RepoSetting = {
				user: 'user',
				repo: 'repo',
				base: 'base'
			};

			const tagsObject: TagsCollection = {
				latest: '1.0.0',
				all: [
					'1.0.0'
				]
			};

			const commitsCollection: ListLogSummary = {
				latest: 'latest commit',
				all: [
					'initial commit',
					'latest commit'
				],
				total: 2
			};

			simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

			simpleGitInstanceMock
				.setup((x) => x.tags(It.isAny()))
				.callback((cb) => cb(null, tagsObject));

			simpleGitInstanceMock
				.setup((x) => x.log(It.isAny(), It.isAny()))
				.callback((_options, cb) => cb(null, commitsCollection));

			githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

			const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

			// Act
			await gitService.HasChanges(destination, repoSetting);

			// Assert
			// This is called twice, once for HasChanges() and once for GetLatestTag()
			simpleGitMock.verify((x) => x(It.is((dest) => dest === destination)), Times.exactly(2));
		});

		it('should use the correct log flags', async () => {
			// Arrange
			const simpleGitMock = Mock.ofType<SimpleGitStatic>();
			const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
			const githubServiceMock = Mock.ofType<IGithubService>();
			const destination = '/some/folder';

			const repoSetting: RepoSetting = {
				user: 'user',
				repo: 'repo',
				base: 'base'
			};

			const tagsObject: TagsCollection = {
				latest: '1.0.0',
				all: [
					'1.0.0'
				]
			};

			const commitsCollection: ListLogSummary = {
				latest: 'latest commit',
				all: [
					'initial commit',
					'latest commit'
				],
				total: 2
			};

			simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

			simpleGitInstanceMock
				.setup((x) => x.tags(It.isAny()))
				.callback((cb) => cb(null, tagsObject));

			simpleGitInstanceMock
				.setup((x) => x.log(It.isAny(), It.isAny()))
				.callback((_options, cb) => cb(null, commitsCollection));

			githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

			const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

			// Act
			await gitService.HasChanges(destination, repoSetting);

			// Assert
			simpleGitInstanceMock
				.verify((x) => x.log(
					It.is((options) => {
						return Array.isArray(options) &&
							options.includes('--merges') &&
							options.includes('base...1.0.0');
					}),
					It.isAny()
				), Times.once());
		});

		it('should reject if there was an error getting the commit log', (done) => {
			// Arrange
			const simpleGitMock = Mock.ofType<SimpleGitStatic>();
			const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
			const githubServiceMock = Mock.ofType<IGithubService>();
			const destination = '/some/folder';

			const repoSetting: RepoSetting = {
				user: 'user',
				repo: 'repo',
				base: 'base'
			};

			const tagsObject: TagsCollection = {
				latest: '1.0.0',
				all: [
					'1.0.0'
				]
			};

			simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

			simpleGitInstanceMock
				.setup((x) => x.tags(It.isAny()))
				.callback((cb) => cb(null, tagsObject));

			simpleGitInstanceMock
				.setup((x) => x.log(It.isAny(), It.isAny()))
				.callback((_options, cb) => cb('Error', null));

			githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

			const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

			// Act
			const logPromise = gitService.HasChanges(destination, repoSetting);

			// Assert
			expect(logPromise).to.be.rejected.and.notify(done);
		});

		it('should reject if there was an error getting the latest tag', (done) => {
			// Arrange
			const simpleGitMock = Mock.ofType<SimpleGitStatic>();
			const simpleGitInstanceMock = Mock.ofType<SimpleGitInstance>();
			const githubServiceMock = Mock.ofType<IGithubService>();
			const destination = '/some/folder';

			const repoSetting: RepoSetting = {
				user: 'user',
				repo: 'repo',
				base: 'base'
			};

			const commitsCollection: ListLogSummary = {
				latest: 'Latest Commit',
				all: [
					'Initial Commit',
					'Latest Commit'
				],
				total: 2
			};

			simpleGitMock.setup((x) => x(It.isAnyString())).returns(() => simpleGitInstanceMock.object);

			simpleGitInstanceMock
				.setup((x) => x.tags(It.isAny()))
				.callback((cb) => cb('Error', null));

			simpleGitInstanceMock
				.setup((x) => x.log(It.isAny(), It.isAny()))
				.callback((_options, cb) => cb(null, commitsCollection));

			githubServiceMock.setup((x) => x.GetRepoUrl(It.isAny())).returns(() => 'user/repo');

			const gitService = new GitService(simpleGitMock.object, githubServiceMock.object);

			// Act
			const logPromise = gitService.HasChanges(destination, repoSetting);

			// Assert
			expect(logPromise).to.be.rejected.and.notify(done);
		});
	});
});
