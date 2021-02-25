# felte

## 0.4.8

### Patch Changes

- a5bab38: Handle undefined reporter handler

## 0.4.7

### Patch Changes

- 61f0348: Handles `validate` possibly returning an undefined value

## 0.4.6

### Patch Changes

- Call reporters on component initialization
- Updated dependencies [undefined]
  - @felte/common@0.1.4

## 0.4.5

### Patch Changes

- bca2c8e: Change format exported from CJS to UMD
- Updated dependencies [bca2c8e]
  - @felte/common@0.1.3

## 0.4.4

### Patch Changes

- eaf4aae: Fix bug on which a reporter updating the DOM might cause an infinite loop

## 0.4.3

### Patch Changes

- d9f73e5: Removes most of lodash dependencies for functionality in @felte/common and adds @felte/reporter-dom
- Updated dependencies [d9f73e5]
  - @felte/common@0.1.2

## 0.4.2

### Patch Changes

- `felte` now deppends on `@felte/common` and removed its helpers.

## 0.4.1

### Patch Changes

- `commitlint` and `husky` added to lint commits.
- The `onError` function can now return an object with the same shape as `Errors` that will be set on the `errors` store and can be used by reporters in the `onSubmitError` function.

## 0.4.0

### Minor Changes

- Utility functions `setTouched`, `setError` and `setField` exported from `createForm`.
- Errors for each field are now stored in the `data-felte-validation-message` attribute.
- Error reporting now can be handled using the `reporter` config option.
- `data-unset-on-remove` is now `data-felte-unset-on-remove`.
- The `errors` store is now a writable store.
- Removed built-in handling for constraint validation API. Moved to a `reporter` package.
