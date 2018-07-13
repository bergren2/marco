## Contributing
**Be sure to read the [setup guide](local-development.md#Setup)!**

#### Contents
- [Guidelines](#guidelines)
- [Pull Request Process](#pull-request-process)
- [Versioning](#versioning)

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
