# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.1] – 2023-11-30
### Changed
- Fix way to import modules.

## [1.1.0] – 2023-11-30
### Changed
- Remove webpack helpers.
- Update docs.

## [1.0.0] – 2023-11-30
### Changed
- Change package type to module.

## [0.7.2] – 2023-10-22
### Fixed
- AppConsoleFrame: Fix progress bar code for azure build

## [0.7.0] – 2023-02-05
### Added
- AppConsoleFrame: Add possible to run scripts before start building.

## [0.6.1] – 2022-10-16
### Fixed
- Fix paths for eslint and webpack files

## [0.6.0] – 2022-10-16
### Changed
- Change place of default files, validators and modifiers for ide scripts dbetka A minute ago
- Update docs

## [0.5.2] – 2022-09-23
### Fixed
- Correct CHANGELOG file
- Correct docs about export-intellij-settings

## [0.5.1] – 2022-09-22
### Added
- Default values for cli params in export-intellij-settings
### Fixed
- Cli export-intellij-settings

## [0.5.0] – 2022-09-22
### Updated
- Refactor console messages
- Make semicolon required in tslint rules
- Separate shell to helpers
### Added
- Lint before each build
### Fixed
- Correct tsconfig
- Correct path for codeStyleConfig

## [0.4.0] – 2022-09-20
### Updated
- IDE: Docs for init-intellij-settings
- IDE: Plugin API refactor
### Added
- IDE: Possible to replace target file if exists 
- IDE: Possible to replace target file if it has unexpected structure, or it's corrupted
### Fixed
- IDE: Validator condition

## [0.3.2] – 2022-09-20
### Added
- IDE: default-validators and modifiers
- IDE: xml-utils
- IDE: Add default xml configuration files
### Fixed
- IDE: Show errors stack

## [0.3.1] – 2022-09-19
### Fixed
- Dependencies tree – move xml2js and chalk to dependencies

## [0.3.0] – 2022-09-19
### Added
- Create InitIntellijSettings lib and docs for it

## [0.2.14] – 2022-08-31
### Updated 
- Readme file for whole project
### Added
- AppConsoleFrame: Add readme for plugin 

## [0.2.13] – 2022-08-23
### Changed
- AppConsoleFrame: Clear console down before each write usage
- Remove npm dependencies vulnerabilities

## [0.2.12] – 2022-08-23
### Changed
- AppConsoleFrame: Clear line before write
- AppConsoleFrame: Stop process on error in additional activities
### Added
- CHANGELOG.md file

## [0.2.11] – 2022-06-09
### Fixed
- AppConsoleFrame: Fix running additional activities in sequence

## [0.2.10] – 2022-05-24
### Fixed
- AppConsoleFrame: Make functionality for additional scripts late for 200ms

## [0.2.9] – 2022-05-24
### Fixed
- AppConsoleFrame: Fix and refactor functionality for additional scripts

## [0.2.8] – 2022-05-24
### Added
- AppConsoleFrame: Add additional scripts on build done

## [0.2.7] – 2022-05-24
### Fixed
- HTTPService: Correct fetchProxy method type

## [0.2.6] – 2022-05-24
### Added
- HTTPService: Add possible to set fetch proxy method

## [0.2.5] – 2022-04-22
### Fixed
- ProgressBar: Do not throw error if stream is not available and correct types

## [0.2.4] – 2022-04-19
### Added
- AppConsoleFrame: Add isClientApp parameter to config

## [0.2.3] – 2022-04-19
### Added
- Separate dependencies and devDependencies in package.json

## [0.2.2] – 2022-04-15
### Changed
- AppConsoleFrame: Refactor plugin API
### Added
- AppConsoleFrame: Fix assets list

## [0.2.1] – 2022-04-15
### Changed
- AppConsoleFrame: Upgrade chalk version

## [0.2.0] – 2022-04-15
### Added
- Add webpack plugins AppConsoleFrame and ProgressBar

## [0.1.8] – 2022-03-09
### Removed
- Remove prettier from package.json
- Remove preversion from package.json
- Remove prepublish from package.json

## [0.1.7] – 2022-03-09
### Changed
- Modify status code handling

## [0.1.5] – 2021-12-13
### Fixed
- Fix bug in array removeItem, and finish tests for this module
### Changed
- Add typing for backend error
- Simplify http service
- Change root http root url
- Change param name from queryParamsObject to queryObject
- Throw error if httpService.getInstance() without provided config
- Rewrite errors handling in http service to be more generic for other solutions than harcmap handling. Enable 2 error catching modes
- Improvements for http service
- Rewrite http handling into single service, testing with test for it
- Move and rewrite in ts validate-tools, random, promise, id, communicates utils
### Added
- Add geolocationService and tests for it
- First ugly but working version of httpService tests
### Removed
- Remove example Greeter

## [0.1.4] – 2021-06-22
### Added
- Add arrayUtils removeItemByIndex

## [0.1.3] – 2021-06-22
### Fixed
- Fix Jest config
### Added
- Add array utils

## [0.1.2] – 2021-05-19
### Added
- Init project


