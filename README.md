[![Build Status](https://api.travis-ci.org/rehret/marco.svg?branch=master)](https://travis-ci.org/rehret/marco)
[![Coverage Status](https://coveralls.io/repos/github/rehret/marco/badge.svg?branch=master)](https://coveralls.io/github/rehret/marco?branch=master)

# Marco
Simple CLI tool for fetching list of projects which are ready for a release.

After configuring all managed repositories, this tool will list the projects which have unreleased changes (based on version tags).

## Assumptions
- Target repo is hosted on [GitHub](https://github.com)
- User has [configured an SSH key with GitHub](https://help.github.com/articles/connecting-to-github-with-ssh/)
- Target repo uses tags for versioning
- Target repo uses SemVer

## Installation & Usage
```bash
npm install --global marco-cli
marco
```

## Contributing
### Getting Started
#### Prerequisites
[NodeJS](https://nodejs.org/) is required. It can be installed [here](https://nodejs.org/en/download/).

This project uses [yarn](https://yarnpkg.com) in place of npm. Follow [these instructions](https://yarnpkg.com/en/docs/install) to install yarn globally.

> Warning: Windows users should not install [yarn](https://yarnpkg.com) via NPM, instead use the [downloadable](https://yarnpkg.com/latest.msi) MSI executable.

Once installed, yarn is used to install all dependencies.
```bash
yarn install
```

#### Local Development
```bash
yarn build
bin/marco
```

#### Guidelines
Make sure you have [tslint](https://www.npmjs.com/package/tslint) installed globally. This project is linted before each build. All code contributions should have zero linting errors.

Also, install [EditorConfig](http://editorconfig.org/) in your editor. This will help keep a consistent code style throughout the project.

This project makes use of [GitHub Flow](https://guides.github.com/introduction/flow/). As such, work should be done on a feature branch and a pull request opened against `master` once the work is complete. Feature branches should following the naming convention `feature/<feature-name>`.

##### Pull Request Process
Pull requests will undergo a technical and functional review. After both reviews have passed, and given that the base and feature branches are correct (as stated above), the pull request will be merged by the maintainer.

##### Versioning
Version numbers will follow [SemVer](https://semver.org/) versioning:
> Major.Minor.Patch

For example, this is a valid version number:
> 1.2.345

Any changes that affect the major, minor, or patch versioning should have a tag pushed to `origin` with the SemVer version (consisting of major, minor, and patch).
For example, if the project was at version `0.1.0` and it was decided that it was ready for official release, the tag `1.0.0` would be pushed to origin at that commit.

Additionally, the version should be updated to match in [package.json](package.json).

## License
[MIT](LICENSE)
