# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).


## [2.0.1] 2018-03-14
### Added
- Made `gitRepo.getCurrentBranch()` resolve with `undefined` when in a detached head state.
### Changed
- Enhanced tag messages to include branch name, commit hash and username.


## [2.0.0] 2018-03-13
### Changed
Significantly changed the way this tool publishes to Git.
  - The same repo that is used for development is always used to publishing.
  - When publishing, branches are not created for the major and minor release
    numbers.  Now a release directly branches off of the code that was used to
    build it.
### Removed
- `publishtogit.json` is no longer used.


## [1.0.5] 2018-03-09
### Added
- SemVer now supports prerelease strings.
### Changed
- Updated release instructions.


## [1.0.4] 2018-03-01
### Added
- Added a `--tag` command line option that can be used to specify an additional tag
to be applied to the published commit.  This option can be specified multiple
times in order to create multiple tags.  If a tag already exists, it is moved.


## [v1.0.3] 2018-02-25
### Added
for new features.
### Changed
- The tag created applied when publishing is no longer
"v<major>.<minor>.<patch>".  Instead, it is "v<package.json_version" so that
prerelease tags can be used (e.g. 1.2.3-alpha.3).
