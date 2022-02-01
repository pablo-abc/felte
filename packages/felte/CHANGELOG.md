# felte

## 1.0.0-next.25

### Minor Changes

- fcbdaed: Add `swapFields` and `moveField` helper functions

### Patch Changes

- Updated dependencies [fcbdaed]
  - @felte/core@1.0.0-next.25

## 1.0.0-next.24

### Minor Changes

- 990034e: Add `interacted` store to show which is the last field the user has interacted with
- 0faaa8f: Add isValidating store

### Patch Changes

- Updated dependencies [990034e]
- Updated dependencies [5c71750]
- Updated dependencies [0faaa8f]
  - @felte/core@1.0.0-next.24

## 1.0.0-next.23

### Patch Changes

- Updated dependencies [8282a70]
  - @felte/core@1.0.0-next.23

## 1.0.0-next.22

### Minor Changes

- c412050: Add support for custom controls with `createField`/`useField`

### Patch Changes

- Updated dependencies [b9ea48d]
  - @felte/core@1.0.0-next.22

## 1.0.0-next.21

### Patch Changes

- Updated dependencies [0b38b98]
  - @felte/core@1.0.0-next.21

## 1.0.0-next.20

### Patch Changes

- 2e7aad3: Add type for keyed Data
- Updated dependencies [2e7aad3]
- Updated dependencies [2e7aad3]
  - @felte/core@1.0.0-next.20

## 1.0.0-next.19

### Minor Changes

- c8c1511: Add unique key to field arrays

### Patch Changes

- Updated dependencies [c8c1511]
  - @felte/core@1.0.0-next.19

## 1.0.0-next.18

### Major Changes

- 093482a: BREAKING: Setting directly to `data` using `data.set` no longer touches the field. The `setFields` helper should be used instead if this behaviour is desired.

### Minor Changes

- 093482a: Add isValidating store

### Patch Changes

- Updated dependencies [093482a]
- Updated dependencies [093482a]
  - @felte/core@1.0.0-next.18

## 1.0.0-next.17

### Patch Changes

- Updated dependencies [dd52c94]
  - @felte/core@1.0.0-next.17

## 1.0.0-next.16

### Major Changes

- a45d56c: BREAKING: `errors` and `warning` stores will either have `null` or an array of strings as errors

### Patch Changes

- Updated dependencies [a45d56c]
  - @felte/core@1.0.0-next.16

## 1.0.0-next.15

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

### Patch Changes

- Updated dependencies [452fe5a]
- Updated dependencies [15d0ce2]
  - @felte/core@1.0.0-next.15

## 1.0.0-next.14

### Major Changes

- b7ef442: BREAKING: Remove `addWarnValidator` in favour of options to `addValidator`.

  This gives a smaller and more unified API, as well as opening to add more options in the future.

  If you have an extender using `addWarnValidator`, you must update it by calling `addValidator` instead with the following options:

  ```javascript
  addValidator(yourValidationFunction, { level: 'warning' });
  ```

### Minor Changes

- a1dbc28: Improve types

### Patch Changes

- Updated dependencies [a1dbc28]
- Updated dependencies [ec740a0]
- Updated dependencies [34e0393]
- Updated dependencies [b7ef442]
- Updated dependencies [477bb45]
  - @felte/core@1.0.0-next.14

## 1.0.0-next.13

### Patch Changes

- f315439: Export events as types
- Updated dependencies [f315439]
  - @felte/core@1.0.0-next.13

## 1.0.0-next.12

### Minor Changes

- dc1f21a: Add helper functions to context passed to `onSuccess`, `onSubmit` and `onError`
- eea3afa: Pass context data to `onError` and `onSuccess`

### Patch Changes

- Updated dependencies [dc1f21a]
- Updated dependencies [eea3afa]
  - @felte/core@1.0.0-next.12

## 1.0.0-next.11

### Patch Changes

- 38fbb49: Point "browser" field to esm bundle
- Updated dependencies [38fbb49]
  - @felte/core@1.0.0-next.11

## 1.0.0-next.10

### Patch Changes

- @felte/core@1.0.0-next.10

## 1.0.0-next.9

### Patch Changes

- 46b05e3: Fix when publishing as modules
- Updated dependencies [46b05e3]
  - @felte/core@1.0.0-next.9

## 1.0.0-next.8

### Patch Changes

- e49c094: Use `preserveModules` for better tree-shaking
- Updated dependencies [e49c094]
  - @felte/core@1.0.0-next.8

## 1.0.0-next.7

### Patch Changes

- Updated dependencies [62ceb3f]
  - @felte/core@1.0.0-next.7

## 1.0.0-next.6

### Minor Changes

- f9b9125: Add `feltesuccess` and `felteerror` events
- 96c3c18: Add default submit handler

### Patch Changes

- Updated dependencies [f9b9125]
- Updated dependencies [96c3c18]
- Updated dependencies [d1b62bf]
  - @felte/core@1.0.0-next.6

## 1.0.0-next.5

### Patch Changes

- @felte/core@1.0.0-next.5

## 1.0.0-next.4

### Patch Changes

- 8c29b4a: Fix unset on Safari
- Updated dependencies [8c29b4a]
  - @felte/core@1.0.0-next.4

## 1.0.0-next.3

### Minor Changes

- 6f48123: Add `addField` helper function

### Patch Changes

- Updated dependencies [6f48123]
  - @felte/core@1.0.0-next.3

## 1.0.0-next.2

### Major Changes

- 77de471: BREAKING: Stop proxying inputs. This was causing all sorts of race conditions which were a headache to solve. Instead we're going to keep a single recommendation: If you wish to programatically set the value of an input, use the `setFields` helper.
- 02a77e3: BREAKING: When removing an input from an array of inputs, Felte now splices the array instead of setting the value to `null`/`undefined`. This means that an `index` on an array of inputs is no longer a _unique_ identifier and the value can move around if fields are added/removed.

### Patch Changes

- Updated dependencies [77de471]
- Updated dependencies [02a77e3]
  - @felte/core@1.0.0-next.2

## 1.0.0-next.0

### Major Changes

- a2ea0b2: BREAKING: `setFields` no longer touches a field by default. It needs to be explicit and it's only possible when passing a string path. E.g. `setField(‘email’ , 'zaphod@beeblebrox.com')` now is `setFields('email', 'zaphod@beeblebrox.com', true)`.
- 1dd68e7: BREAKING: Remove `data-felte-unset-on-remove` in favour of `data-felte-keep-on-remove`. Felte will now remove fields by default if removed from the DOM.

  To keep the same behaviour as before, add `data-felte-keep-on-remove` to any dynamic inputs you had that didn't have `data-felte-unset-on-remove` previously. And remove `data-felte-unset-on-remove` from the inputs that had it, or replace it for `data-felte-keep-on-remove="false"` if it was used to override a parent's attribute.

- 6109533: BREAKING: apply transforms to initialValues
- 0d22bc6: BREAKING: Helpers have been completely reworked.
  `setField` and `setFields` have been unified in a single `setFields` helper.
  Others such as `setError` and `setWarning` have been pluralized to `setErrors` and `setWarnings` since now they can accept the whole object.
  `setTouched` now requires to be passed the value to assign. E.g. `setTouched('path')` is now `setTouched('path', true)`. It no longer accepts an index as an argument since that can be assigned in the path itself using `[]`.
- 3d571bb: BREAKING: Remove `getField` helper in favor of `getValue` export. E.g. `getField('email')` now is `getValue($data, 'email')` and accessors.
- 2c0f874: Make type of helpers and stores looser when using a transform function

### Minor Changes

- c1f32a0: Add `unsetField` and `resetField` helper functions

### Patch Changes

- Updated dependencies [1bc036e]
- Updated dependencies [6431ee4]
- Updated dependencies [a2ea0b2]
- Updated dependencies [1dd68e7]
- Updated dependencies [6109533]
- Updated dependencies [9a48a40]
- Updated dependencies [0d22bc6]
- Updated dependencies [3d571bb]
- Updated dependencies [c1f32a0]
- Updated dependencies [2c0f874]
  - @felte/core@1.0.0-next.0

## 0.9.0

### Minor Changes

- 6fe19bf: BREAKING: Felte core now only needs a store factory to work. Framework integrations do not need to provide all stores but only a factory function that creates an observable.

### Patch Changes

- 6fe19bf: Add support for warnings
- 6fe19bf: Change build output from umd to cjs, since Felte is not planned to be used as a global import, a umd build is not necessary.
- 6fe19bf: Clean up subscriptions if Felte wasn't used by registering the form using `form()`
- Updated dependencies [6fe19bf]
- Updated dependencies [6fe19bf]
- Updated dependencies [6fe19bf]
  - @felte/core@0.3.0

## 0.8.7

### Patch Changes

- 4b637d0: Add `setInitialValues` helper and `isDirty` store
- 5d7b58d: Return `getField` helper from createForm
- Updated dependencies [4b637d0]
- Updated dependencies [5d7b58d]
  - @felte/core@0.2.7

## 0.8.6

### Patch Changes

- Updated dependencies [e324a45]
  - @felte/core@0.2.6

## 0.8.5

### Patch Changes

- Updated dependencies [1807c09]
  - @felte/core@0.2.5

## 0.8.4

### Patch Changes

- 14b3645: Add `transform` feature
- Updated dependencies [14b3645]
  - @felte/core@0.2.4

## 0.8.3

### Patch Changes

- Updated dependencies [3dcfe7c]
  - @felte/core@0.2.3

## 0.8.2

### Patch Changes

- Updated dependencies [e1afd46]
  - @felte/core@0.2.2

## 0.8.1

### Patch Changes

- 096f9a5: Pass a `context` to `onSubmit` calls
- f79c67f: Listen to programmatic changes of inputs
- Updated dependencies [096f9a5]
- Updated dependencies [f79c67f]
  - @felte/core@0.2.1

## 0.8.0

### Minor Changes

- 2d3b213: BREAKING: Remove `reporter` configuration option in favor of `extend`.

### Patch Changes

- Updated dependencies [2d3b213]
- Updated dependencies [de71f43]
  - @felte/core@0.2.0

## 0.7.13

### Patch Changes

- 5bb4a02: Add data-felte-ignore attribute to make Felte completely ignore an input
- Updated dependencies [5bb4a02]
  - @felte/core@0.1.6

## 0.7.12

### Patch Changes

- Updated dependencies [6b8aafb]
  - @felte/core@0.1.5

## 0.7.11

### Patch Changes

- 16ff018: Export ES module as default
- Updated dependencies [16ff018]
  - @felte/core@0.1.4

## 0.7.10

### Patch Changes

- e6034c0: Use `Record<string, any>` for config type in order to allow interfaces to be passed as types
- Updated dependencies [e6034c0]
  - @felte/core@0.1.3

## 0.7.9

### Patch Changes

- Updated dependencies [8049209]
  - @felte/core@0.1.2

## 0.7.8

### Patch Changes

- 3118b72: Use @felte/core instead of @felte/common

## 0.7.7

### Patch Changes

- Fix issues due to mutability of common functions
- Updated dependencies [undefined]
  - @felte/core@0.1.1

## 0.7.6

### Patch Changes

- 809f9af: Refactor to use a common core
- Updated dependencies [809f9af]
  - @felte/core@0.1.0

## 0.7.5

### Patch Changes

- Fix external dependencies on build

## 0.7.4

### Patch Changes

- Fix textarea not listening to changes

## 0.7.3

### Patch Changes

- c31e1cc: Fix select element being validate on start
- Updated dependencies [c31e1cc]
  - @felte/common@0.4.3

## 0.7.2

### Patch Changes

- d20c7b8: Fixed initialValues not being set for select and textarea elements
- Updated dependencies [d20c7b8]
  - @felte/common@0.4.2

## 0.7.1

### Patch Changes

- 04fd142: Fix adding from array not adding defautl value
- Updated dependencies [04fd142]
  - @felte/common@0.4.1

## 0.7.0

### Minor Changes

- 230e76d: Handle inputs generated with an array

### Patch Changes

- Updated dependencies [230e76d]
  - @felte/common@0.4.0

## 0.6.8

### Patch Changes

- 4dadaac: Do not touch text fields on input. Only on blur

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
