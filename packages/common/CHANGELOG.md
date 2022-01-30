# @felte/common

## 1.0.0-next.19

### Minor Changes

- a174e87: Add isEqual utility to check for strict equality

## 1.0.0-next.18

### Patch Changes

- 70cfada: Fix deepSome handling arrays

## 1.0.0-next.17

### Patch Changes

- 2e7aad3: Add type for keyed Data

## 1.0.0-next.16

### Minor Changes

- c8c1511: Add unique key to field arrays

## 1.0.0-next.15

### Minor Changes

- 093482a: Add isValidating store

## 1.0.0-next.14

### Patch Changes

- dd52c94: Fix error filtering

## 1.0.0-next.13

### Major Changes

- a45d56c: BREAKING: `errors` and `warning` stores will either have `null` or an array of strings as errors

## 1.0.0-next.12

### Major Changes

- 452fe5a: BREAKING: Remove `data-felte-index` attribute support.

  This means that you should replace this:

  ```html
  <input data-felte-index="1" name="preferences" />
  ```

  To this:

  ```html
  <input name="preferences.1" />
  ```

  This was done in order to allow for future improvements of the type system for TypeScript users, and to also follow the same behaviour the browser would do if JavaScript is disabled

- 15d0ce2: BREAKING: Stop grabbing nested names from fieldset

  This means that this won't work anymore:

  ```html
  <fieldset name="account">
    <input name="email" />
  </fieldset>
  ```

  So it needs to be changed to this:

  ```html
  <fieldset>
    <input name="account.email" />
  </fieldset>
  ```

  This was done to allow for future improvements on type-safety, as well to keep consistency with the browser's behaviour when JavaScript is disabled.

## 1.0.0-next.11

### Major Changes

- b7ef442: BREAKING: Remove `addWarnValidator` in favour of options to `addValidator`.

  This gives a smaller and more unified API, as well as opening to add more options in the future.

  If you have an extender using `addWarnValidator`, you must update it by calling `addValidator` instead with the following options:

  ```javascript
  addValidator(yourValidationFunction, { level: 'warning' });
  ```

### Minor Changes

- a1dbc28: Improve types
- ec740a0: Update types
- 34e0393: Make string paths for accessors type safe
- e1ad8cd: Export `mergeErrors` util

## 1.0.0-next.10

### Minor Changes

- dc1f21a: Add helper functions to context passed to `onSuccess`, `onSubmit` and `onError`
- eea3afa: Pass context data to `onError` and `onSuccess`

## 1.0.0-next.9

### Patch Changes

- 38fbb49: Point "browser" field to esm bundle

## 1.0.0-next.8

### Patch Changes

- c86a82a: Preserve modules in CJS

## 1.0.0-next.7

### Patch Changes

- e49c094: Use `preserveModules` for better tree-shaking

## 1.0.0-next.6

### Patch Changes

- d1b62bf: Allow for `onError` and `onSuccess` to be asynchronous

## 1.0.0-next.5

### Patch Changes

- e2f4e18: Clone object on update function

## 1.0.0-next.3

### Patch Changes

- 8c29b4a: Fix unset on Safari

## 1.0.0-next.2

### Minor Changes

- 6f48123: Add `addField` helper function

## 1.0.0-next.1

### Major Changes

- 02a77e3: BREAKING: When removing an input from an array of inputs, Felte now splices the array instead of setting the value to `null`/`undefined`. This means that an `index` on an array of inputs is no longer a _unique_ identifier and the value can move around if fields are added/removed.

## 1.0.0-next.0

### Major Changes

- 9a48a40: Pass a new property `stage` to extenders to distinguish between setup, mount and update stages
- 0d22bc6: BREAKING: Helpers have been completely reworked.
  `setField` and `setFields` have been unified in a single `setFields` helper.
  Others such as `setError` and `setWarning` have been pluralized to `setErrors` and `setWarnings` since now they can accept the whole object.
  `setTouched` now requires to be passed the value to assign. E.g. `setTouched('path')` is now `setTouched('path', true)`. It no longer accepts an index as an argument since that can be assigned in the path itself using `[]`.
- 3d571bb: BREAKING: Remove `getField` helper in favor of `getValue` export. E.g. `getField('email')` now is `getValue($data, 'email')` and accessors.
- 2c0f874: Make type of helpers and stores looser when using a transform function

### Minor Changes

- c1f32a0: Add `unsetField` and `resetField` helper functions

## 0.6.0

### Minor Changes

- 6fe19bf: BREAKING: Felte core now only needs a store factory to work. Framework integrations do not need to provide all stores but only a factory function that creates an observable.

### Patch Changes

- 6fe19bf: Add support for warnings
- 6fe19bf: Change build output from umd to cjs, since Felte is not planned to be used as a global import, a umd build is not necessary.

## 0.5.4

### Patch Changes

- 4b637d0: Add `setInitialValues` helper and `isDirty` store
- 5d7b58d: Return `getField` helper from createForm

## 0.5.3

### Patch Changes

- e324a45: Add `reset`, `validate` and `setFields` helpers to extenders

## 0.5.2

### Patch Changes

- 14b3645: Add `transform` feature

## 0.5.1

### Patch Changes

- 096f9a5: Pass a `context` to `onSubmit` calls

## 0.5.0

### Minor Changes

- 2d3b213: BREAKING: Remove `reporter` configuration option in favor of `extend`.

### Patch Changes

- a7e7e35: Fix merge of array of objects and non-objects
- de71f43: Add `addValidator` utility for extenders

## 0.4.10

### Patch Changes

- 5bb4a02: Add data-felte-ignore attribute to make Felte completely ignore an input

## 0.4.9

### Patch Changes

- 16ff018: Export ES module as default

## 0.4.8

### Patch Changes

- af4b183: fix falsy initial values are ignored
- e6034c0: Use `Record<string, any>` for config type in order to allow interfaces to be passed as types

## 0.4.7

### Patch Changes

- 8049209: Fix Felte not removing the field from the data store when the input has a fieldset and the fieldset is not removed alongside the input.

## 0.4.6

### Patch Changes

- fc42f8d: Fix getPath

## 0.4.5

### Patch Changes

- 56ee618: Refactor to use getPath from `@felte/common`

## 0.4.4

### Patch Changes

- Fix issues due to mutability of common functions

## 0.4.3

### Patch Changes

- c31e1cc: Fix select element being validate on start

## 0.4.2

### Patch Changes

- d20c7b8: Fixed initialValues not being set for select and textarea elements

## 0.4.1

### Patch Changes

- 04fd142: Fix adding from array not adding defautl value

## 0.4.0

### Minor Changes

- 230e76d: Handle inputs generated with an array

## 0.3.7

### Patch Changes

- 3343a02: Fix touched handling for custom controls

## 0.3.6

### Patch Changes

- aabce0d: Add require exports

## 0.3.5

### Patch Changes

- d2d79cb: Make package tree shakeable

## 0.3.4

### Patch Changes

- 55c1f90: Remove lodash dependency
- 99354f1: Removes merge and mergeWith dependency from lodash

## 0.3.3

### Patch Changes

- 5df429d: Fix \_get not being able to retrieve objects

## 0.3.2

### Patch Changes

- f5c7cdf: Fix issue where NaN was being parsed as 0 in an `input[type=number]`

## 0.3.1

### Patch Changes

- f5a52e1: Return `setFields` function from `createForm` to set all fields of the form

## 0.3.0

### Minor Changes

- 52f9043: Allow `validate` configuration option to be an array of functions

## 0.2.4

### Patch Changes

- 53e5278: Pass config object to extender

## 0.2.3

### Patch Changes

- a664ef3: Update types to allow validator to return undefined

## 0.2.2

### Patch Changes

- d7d43d3: Fix minor bugs found while testing

## 0.2.0

### Minor Changes

- f09b65b: BREAKING: `reporter` renamed to `extend` since its current API can be used to extende Felte's behaviour freely

## 0.1.6

### Patch Changes

- bace787: Add createSubmitHandler helper function to allow to override submit handler

## 0.1.5

### Patch Changes

- 1c6017f: Add `reset` helper function that resets the whole form to its original values
- 8a50ad7: Add a `validate` helper function to force validation of the whole form

## 0.1.4

### Patch Changes

- Call reporters on component initialization

## 0.1.3

### Patch Changes

- bca2c8e: Change format exported from CJS to UMD

## 0.1.2

### Patch Changes

- d9f73e5: Removes most of lodash dependencies for functionality in @felte/common and adds @felte/reporter-dom
