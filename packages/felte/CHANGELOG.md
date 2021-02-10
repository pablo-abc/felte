# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project will adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) after 1.0.0. Before that, minor versions might contain breaking changes.

## [Unreleased]

### Added

- Utility functions `setTouched`, `setError`, `setField` and `reportValidity` exported from `createForm`.
- Errors for each field are now stored in the `data-felte-validation-message` attribute.
- Error reporting now can be handled using the `reporter` config option.

### Changed

- `data-unset-on-remove` is now `data-felte-unset-on-remove`.
- The `errors` store is now a writable store.
