# @felte/core

## 0.3.0

### Minor Changes

- 6fe19bf: BREAKING: Felte core now only needs a store factory to work. Framework integrations do not need to provide all stores but only a factory function that creates an observable.

### Patch Changes

- 6fe19bf: Add support for warnings
- 6fe19bf: Change build output from umd to cjs, since Felte is not planned to be used as a global import, a umd build is not necessary.
- Updated dependencies [6fe19bf]
- Updated dependencies [6fe19bf]
- Updated dependencies [6fe19bf]
  - @felte/common@0.6.0

## 0.2.7

### Patch Changes

- 4b637d0: Add `setInitialValues` helper and `isDirty` store
- 5d7b58d: Return `getField` helper from createForm
- Updated dependencies [4b637d0]
- Updated dependencies [5d7b58d]
  - @felte/common@0.5.4

## 0.2.6

### Patch Changes

- e324a45: Add `reset`, `validate` and `setFields` helpers to extenders
- Updated dependencies [e324a45]
  - @felte/common@0.5.3

## 0.2.5

### Patch Changes

- 1807c09: Prevent proxying unnamed inputs

## 0.2.4

### Patch Changes

- 14b3645: Add `transform` feature
- Updated dependencies [14b3645]
  - @felte/common@0.5.2

## 0.2.3

### Patch Changes

- 3dcfe7c: Call submit handler on `HTMLFormElement.requestSubmit()`

## 0.2.2

### Patch Changes

- e1afd46: Fix proxy for select and textarea elements

## 0.2.1

### Patch Changes

- 096f9a5: Pass a `context` to `onSubmit` calls
- f79c67f: Listen to programmatic changes of inputs
- Updated dependencies [096f9a5]
  - @felte/common@0.5.1

## 0.2.0

### Minor Changes

- 2d3b213: BREAKING: Remove `reporter` configuration option in favor of `extend`.

### Patch Changes

- de71f43: Add `addValidator` utility for extenders
- Updated dependencies [a7e7e35]
- Updated dependencies [2d3b213]
- Updated dependencies [de71f43]
  - @felte/common@0.5.0

## 0.1.6

### Patch Changes

- 5bb4a02: Add data-felte-ignore attribute to make Felte completely ignore an input
- Updated dependencies [5bb4a02]
  - @felte/common@0.4.10

## 0.1.5

### Patch Changes

- 6b8aafb: Fix `validate` function on `createSubmitHandler` config not updating errors on store

## 0.1.4

### Patch Changes

- 16ff018: Export ES module as default
- Updated dependencies [16ff018]
  - @felte/common@0.4.9

## 0.1.3

### Patch Changes

- e6034c0: Use `Record<string, any>` for config type in order to allow interfaces to be passed as types
- Updated dependencies [af4b183]
- Updated dependencies [e6034c0]
  - @felte/common@0.4.8

## 0.1.2

### Patch Changes

- 8049209: Fix Felte not removing the field from the data store when the input has a fieldset and the fieldset is not removed alongside the input.
- Updated dependencies [8049209]
  - @felte/common@0.4.7

## 0.1.1

### Patch Changes

- Fix issues due to mutability of common functions
- Updated dependencies [undefined]
  - @felte/common@0.4.4

## 0.1.0

### Minor Changes

- 809f9af: Refactor to use a common core
