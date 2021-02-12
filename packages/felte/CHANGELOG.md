# Changelog

## 0.4.3

### Patch Changes

- d9f73e5: Removes most of lodash dependencies for functionality in @felte/common and adds @felte/reporter-dom
- Updated dependencies [d9f73e5]
  - @felte/common@0.1.2

## [0.4.2] - 2021-11-02

### Changed

- `felte` now deppends on `@felte/common` and removed its helpers.

## [0.4.1] - 2021-10-02

### Added

- `commitlint` and `husky` added to lint commits.

### Changed

- The `onError` function can now return an object with the same shape as `Errors` that will be set on the `errors` store and can be used by reporters in the `onSubmitError` function.

## [0.4.0] - 2021-10-02

### Added

- Utility functions `setTouched`, `setError` and `setField` exported from `createForm`.
- Errors for each field are now stored in the `data-felte-validation-message` attribute.
- Error reporting now can be handled using the `reporter` config option.

### Changed

- `data-unset-on-remove` is now `data-felte-unset-on-remove`.
- The `errors` store is now a writable store.

### Removed

- Removed built-in handling for constraint validation API. Moved to a `reporter` package.
