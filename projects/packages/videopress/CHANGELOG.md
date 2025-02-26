# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2022-08-23
### Added
- Add the VideoUploadArea component without functionality [#25432]
- Migrate VideoPress block to pkg [#25387]
- VideoPress: add ClipboardButtonInput component [#25730]
- VideoPress: serve a minified token bridge version in production env [#25683]
- VPBlock: Support edit from upload (V6) [#25392]

### Changed
- Initialize VideoPress admin UI from the package [#25692]
- Updated package dependencies. [#25338, #25339, #25387, #25628, #25692, #25707, #25762, #25764, #25769]
- VideoPress: capital P [#25717]
- VideoPress: move client-source files from plugin to package [#25687]
- VideoPress: move videopress-token-bridge.js to client/ folder in the VideoPress package [#25676]
- VideoPress: remove sideEffect from package.json [#25714]

### Fixed
- Only add the VideoPress bridge script when a VideoPress player will be rendered on the page. [#24985]

## [0.1.5] - 2022-08-16
### Changed
- Migrating VideoPress code from the plugin to the package [#25412]
- Moving videopress dependencies to the package [#25398]
- Updated package dependencies. [#25347]
- Updated package dependencies. [#25412]

### Fixed
- Fixed missing import for recent VideoPress namespace changes [#25638]

## [0.1.4] - 2022-08-09

- Added REST api endpoint [#25042]

## [0.1.3] - 2022-08-03
### Added
- Added REST api endpoint [#25042]

### Changed
- Updated package dependencies. [#25300, #25315]
- VideoPress: Change package textdomain [#25309]

## [0.1.2] - 2022-07-26
### Changed
- Updated package dependencies. [#25158]

## [0.1.1] - 2022-07-19
### Added
- Add VideoPress Options class [#25047]
- VideoPress: move oEmbed registration to VideoPress package. [#25090]
- XMLRPC class [#24997]

### Changed
- Add mirror repository information to package info. [#25071]
- Updated package dependencies. [#25047]

## 0.1.0 - 2022-07-12
### Added
- Created empty package [#24952]

[0.2.0]: https://github.com/Automattic/jetpack-videopress/compare/v0.1.5...v0.2.0
[0.1.5]: https://github.com/Automattic/jetpack-videopress/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/Automattic/jetpack-videopress/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/Automattic/jetpack-videopress/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/Automattic/jetpack-videopress/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/Automattic/jetpack-videopress/compare/v0.1.0...v0.1.1
