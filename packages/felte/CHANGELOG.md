# felte

## 0.6.7

### Patch Changes

- d362670: Export package.json
- 3343a02: Fix touched handling for custom controls
- Updated dependencies [3343a02]
  - @felte/common@0.3.7

## 0.6.6

### Patch Changes

- f10e84b: Add exports map

## 0.6.5

### Patch Changes

- 76fc715: Mark as side-effect free

## 0.6.4

### Patch Changes

- 55c1f90: Remove lodash dependency
- 99354f1: Removes merge and mergeWith dependency from lodash
- Updated dependencies [55c1f90]
- Updated dependencies [99354f1]
  - @felte/common@0.3.4

## 0.6.3

### Patch Changes

- f5c7cdf: Fix issue where NaN was being parsed as 0 in an `input[type=number]`
- Updated dependencies [f5c7cdf]
  - @felte/common@0.3.2

## 0.6.2

### Patch Changes

- d8fdb4b: Make `initialValues` be able to set default data for controlled inputs

## 0.6.1

### Patch Changes

- f5a52e1: Return `setFields` function from `createForm` to set all fields of the form
- Updated dependencies [f5a52e1]
  - @felte/common@0.3.1

## 0.6.0

### Minor Changes

- 52f9043: Allow `validate` configuration option to be an array of functions

### Patch Changes

- Updated dependencies [52f9043]
  - @felte/common@0.3.0

## 0.5.7

### Patch Changes

- 7f92eb3: Fix typings for config extension

## 0.5.6

### Patch Changes

- 53e5278: Pass config object to extender
- Updated dependencies [53e5278]
  - @felte/common@0.2.4

## 0.5.5

### Patch Changes

- 756b244: Improve DOM mutation recognition
- ebc474f: Fix [#9](https://github.com/pablo-abc/felte/issues/9) where `isSubmitting` was not setting back to `false` on client errors
- f677349: Fix [#10](https://github.com/pablo-abc/felte/issues/10) by resetting the touched store when calling `reset()`

## 0.5.4

### Patch Changes

- a664ef3: Update types to allow validator to return undefined
- Updated dependencies [a664ef3]
  - @felte/common@0.2.3

## 0.5.3

### Patch Changes

- c747986: Bump dependency
- Updated dependencies [c747986]
  - @felte/common@0.2.2

## 0.5.2

### Patch Changes

- d8d39ef: Fix some minor bugs found while testing

## 0.5.0

### Minor Changes

- f09b65b: BREAKING: `reporter` renamed to `extend` since its current API can be used to extende Felte's behaviour freely

### Patch Changes

- 8f90353: Add tests for helpers and fix bugs found
- Updated dependencies [f09b65b]
  - @felte/common@0.2.0

## 0.4.11

### Patch Changes

- bace787: Add createSubmitHandler helper function to allow to override submit handler
- Updated dependencies [bace787]
  - @felte/common@0.1.6

## 0.4.10

### Patch Changes

- 1c6017f: Add `reset` helper function that resets the whole form to its original values
- 8a50ad7: Add a `validate` helper function to force validation of the whole form
- Updated dependencies [1c6017f]
- Updated dependencies [8a50ad7]
  - @felte/common@0.1.5

## 0.4.9

### Patch Changes

- 117676d: Prevent unnecessary changes to felte-validation-message attribute if value hasn't changed

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
