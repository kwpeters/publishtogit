# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

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
