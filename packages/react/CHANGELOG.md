# @felte/react

## 1.2.14

### Patch Changes

- 7c3dffc: Fix typescript issues
- Updated dependencies [7c3dffc]
  - @felte/core@1.4.4

## 1.2.13

### Patch Changes

- Updated dependencies [595c09c]
  - @felte/core@1.4.3

## 1.2.12

### Patch Changes

- Updated dependencies [2e25206]
  - @felte/core@1.4.2

## 1.2.11

### Patch Changes

- 0a99410: Fix dynamically added number input not validating unless touched
- Updated dependencies [0a99410]
  - @felte/core@1.4.1

## 1.2.10

### Patch Changes

- Updated dependencies [6735209]
- Updated dependencies [ffdee29]
  - @felte/core@1.4.0

## 1.2.9

### Patch Changes

- @felte/core@1.3.9

## 1.2.8

### Patch Changes

- d6144a4: Add "types" to package.json "exports" field
- Updated dependencies [d6144a4]
  - @felte/core@1.3.8

## 1.2.7

### Patch Changes

- 5e784f8: Upgrade to node@18
- Updated dependencies [5e784f8]
- Updated dependencies [95c5e1b]
  - @felte/core@1.3.7

## 1.2.6

### Patch Changes

- Updated dependencies [2e109f9]
  - @felte/core@1.3.6

## 1.2.5

### Patch Changes

- 8ef7866: Stop grabbing store types from `svelte/store`
- Updated dependencies [8ef7866]
  - @felte/core@1.3.5

## 1.2.4

### Patch Changes

- Updated dependencies [686907b]
  - @felte/core@1.3.4

## 1.2.3

### Patch Changes

- @felte/core@1.3.3

## 1.2.2

### Patch Changes

- Updated dependencies [ab24c7e]
  - @felte/core@1.3.2

## 1.2.1

### Patch Changes

- Updated dependencies [1386ac3]
  - @felte/core@1.3.1

## 1.2.0

### Minor Changes

- 72f5389: Pass all stores, `createSubmitHandler` and `handleSubmit` to extenders

### Patch Changes

- Updated dependencies [72f5389]
  - @felte/core@1.3.0

## 1.1.7

### Patch Changes

- @felte/core@1.2.5

## 1.1.6

### Patch Changes

- d9e7b12: Stop bundling core/common packages to allow for code reusability
- Updated dependencies [d9e7b12]
  - @felte/core@1.2.4

## 1.1.5

### Patch Changes

- Updated dependencies [9b49b35]
  - @felte/core@1.2.3

## 1.1.4

### Patch Changes

- Updated dependencies [aa6483d]
- Updated dependencies [aa6483d]
  - @felte/core@1.2.2

## 1.1.3

### Patch Changes

- Updated dependencies [1c88b92]
  - @felte/core@1.2.1

## 1.1.2

### Patch Changes

- Updated dependencies [fd58a47]
  - @felte/core@1.2.0

## 1.1.1

### Patch Changes

- Updated dependencies [03b9e01]
- Updated dependencies [6dafd80]
  - @felte/core@1.1.1

## 1.1.0

### Minor Changes

- c00d0e1: Add FelteSubmitEvent and allow to set errors on FelteErrorEvent

  Fixes bug where errors failed silently on submit

### Patch Changes

- c00d0e1: Allow onError to return partial errors
- Updated dependencies [c00d0e1]
- Updated dependencies [c00d0e1]
  - @felte/core@1.1.0

## 1.0.1

### Patch Changes

- 9b492e0: Fix handling of `<select multiple>` elements
- Updated dependencies [9b492e0]
  - @felte/core@1.0.1

## 1.0.0

### Major Changes

- b007b7f: BREAKING: Stop proxying inputs. This was causing all sorts of race conditions which were a headache to solve. Instead we're going to keep a single recommendation: If you wish to programatically set the value of an input, use the `setFields` helper.
- b007b7f: BREAKING: When removing an input from an array of inputs, Felte now splices the array instead of setting the value to `null`/`undefined`. This means that an `index` on an array of inputs is no longer a _unique_ identifier and the value can move around if fields are added/removed.
- b007b7f: BREAKING: `errors` and `warning` stores will either have `null` or an array of strings as errors
- b007b7f: BREAKING: `setFields` no longer touches a field by default. It needs to be explicit and it's only possible when passing a string path. E.g. `setField(‘email’ , 'zaphod@beeblebrox.com')` now is `setFields('email', 'zaphod@beeblebrox.com', true)`.
- b007b7f: BREAKING: Remove `data-felte-unset-on-remove` in favour of `data-felte-keep-on-remove`. Felte will now remove fields by default if removed from the DOM.

  To keep the same behaviour as before, add `data-felte-keep-on-remove` to any dynamic inputs you had that didn't have `data-felte-unset-on-remove` previously. And remove `data-felte-unset-on-remove` from the inputs that had it, or replace it for `data-felte-keep-on-remove="false"` if it was used to override a parent's attribute.

- b007b7f: BREAKING: apply transforms to initialValues
- b007b7f: BREAKING: Remove `addWarnValidator` in favour of options to `addValidator`.

  This gives a smaller and more unified API, as well as opening to add more options in the future.

  If you have an extender using `addWarnValidator`, you must update it by calling `addValidator` instead with the following options:

  ```javascript
  addValidator(yourValidationFunction, { level: "warning" });
  ```

- b007b7f: BREAKING: Helpers have been completely reworked.
  `setField` and `setFields` have been unified in a single `setFields` helper.
  Others such as `setError` and `setWarning` have been pluralized to `setErrors` and `setWarnings` since now they can accept the whole object.
  `setTouched` now requires to be passed the value to assign. E.g. `setTouched('path')` is now `setTouched('path', true)`. It no longer accepts an index as an argument since that can be assigned in the path itself using `[]`.
- b007b7f: BREAKING: Remove `data-felte-index` attribute support.

  This means that you should replace this:

  ```html
  <input data-felte-index="1" name="preferences" />
  ```

  To this:

  ```html
  <input name="preferences.1" />
  ```

  This was done in order to allow for future improvements of the type system for TypeScript users, and to also follow the same behaviour the browser would do if JavaScript is disabled

- b007b7f: Make type of helpers and stores looser when using a transform function
- b007b7f: BREAKING: Setting directly to `data` using `data.set` no longer touches the field. The `setFields` helper should be used instead if this behaviour is desired.
- b007b7f: BREAKING: Stop grabbing nested names from fieldset

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

### Minor Changes

- b007b7f: Add `addField` helper function
- b007b7f: Improve types
- b007b7f: Add isValidating store
- b007b7f: Add `feltesuccess` and `felteerror` events
- b007b7f: Make string paths for accessors type safe
- b007b7f: Add helper functions to context passed to `onSuccess`, `onSubmit` and `onError`
- b007b7f: Add `interacted` store to show which is the last field the user has interacted with
- b007b7f: Add isValidating store
- b007b7f: Add `swapFields` and `moveField` helper functions
- b007b7f: Export `useAccessor`
- b007b7f: Add support for custom controls with `createField`/`useField`
- b007b7f: Add default submit handler
- b007b7f: Add `unsetField` and `resetField` helper functions
- b007b7f: Add unique key to field arrays
- b007b7f: Pass context data to `onError` and `onSuccess`

### Patch Changes

- b007b7f: Fix hot module reloading
- b007b7f: Fix equality checker for files
- b007b7f: Fix unset on Safari
- b007b7f: Point "browser" field to esm bundle
- b007b7f: Fix when publishing as modules
- b007b7f: Use `preserveModules` for better tree-shaking
- b007b7f: Add type for keyed Data
- b007b7f: Export events as types
- b007b7f: Update peer dependencies
- b007b7f: Use ref for form instead of state callback
- b007b7f: Check for strict equality on value change
- b007b7f: Fix `stop is not a function` when using hmr
- b007b7f: Set initial value on first subscription to prevent re-renders
- b007b7f: Change cjs output to have an extension of `.cjs`
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
- Updated dependencies [b007b7f]
  - @felte/core@1.0.0

## 1.0.0-next.30

### Patch Changes

- @felte/core@1.0.0-next.27

## 1.0.0-next.29

### Patch Changes

- 4853b7e: Change cjs output to have an extension of `.cjs`
- Updated dependencies [4853b7e]
  - @felte/core@1.0.0-next.26

## 1.0.0-next.28

### Minor Changes

- fcbdaed: Add `swapFields` and `moveField` helper functions

### Patch Changes

- Updated dependencies [fcbdaed]
  - @felte/core@1.0.0-next.25

## 1.0.0-next.27

### Minor Changes

- 990034e: Add `interacted` store to show which is the last field the user has interacted with
- 0faaa8f: Add isValidating store

### Patch Changes

- Updated dependencies [990034e]
- Updated dependencies [5c71750]
- Updated dependencies [0faaa8f]
  - @felte/core@1.0.0-next.24

## 1.0.0-next.26

### Patch Changes

- Updated dependencies [8282a70]
  - @felte/core@1.0.0-next.23

## 1.0.0-next.25

### Minor Changes

- c412050: Add support for custom controls with `createField`/`useField`

### Patch Changes

- a174e87: Check for strict equality on value change
- Updated dependencies [b9ea48d]
  - @felte/core@1.0.0-next.22

## 1.0.0-next.24

### Patch Changes

- Updated dependencies [0b38b98]
  - @felte/core@1.0.0-next.21

## 1.0.0-next.23

### Patch Changes

- 2e7aad3: Add type for keyed Data
- Updated dependencies [2e7aad3]
- Updated dependencies [2e7aad3]
  - @felte/core@1.0.0-next.20

## 1.0.0-next.22

### Minor Changes

- c8c1511: Add unique key to field arrays

### Patch Changes

- Updated dependencies [c8c1511]
  - @felte/core@1.0.0-next.19

## 1.0.0-next.21

### Major Changes

- 093482a: BREAKING: Setting directly to `data` using `data.set` no longer touches the field. The `setFields` helper should be used instead if this behaviour is desired.

### Minor Changes

- 093482a: Add isValidating store

### Patch Changes

- Updated dependencies [093482a]
- Updated dependencies [093482a]
  - @felte/core@1.0.0-next.18

## 1.0.0-next.20

### Patch Changes

- Updated dependencies [dd52c94]
  - @felte/core@1.0.0-next.17

## 1.0.0-next.19

### Major Changes

- a45d56c: BREAKING: `errors` and `warning` stores will either have `null` or an array of strings as errors

### Patch Changes

- Updated dependencies [a45d56c]
  - @felte/core@1.0.0-next.16

## 1.0.0-next.18

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

## 1.0.0-next.17

### Major Changes

- b7ef442: BREAKING: Remove `addWarnValidator` in favour of options to `addValidator`.

  This gives a smaller and more unified API, as well as opening to add more options in the future.

  If you have an extender using `addWarnValidator`, you must update it by calling `addValidator` instead with the following options:

  ```javascript
  addValidator(yourValidationFunction, { level: "warning" });
  ```

### Minor Changes

- a1dbc28: Improve types
- 34e0393: Make string paths for accessors type safe

### Patch Changes

- Updated dependencies [a1dbc28]
- Updated dependencies [ec740a0]
- Updated dependencies [34e0393]
- Updated dependencies [b7ef442]
- Updated dependencies [477bb45]
  - @felte/core@1.0.0-next.14

## 1.0.0-next.16

### Patch Changes

- f315439: Export events as types
- Updated dependencies [f315439]
  - @felte/core@1.0.0-next.13

## 1.0.0-next.15

### Minor Changes

- dc1f21a: Add helper functions to context passed to `onSuccess`, `onSubmit` and `onError`
- eea3afa: Pass context data to `onError` and `onSuccess`

### Patch Changes

- Updated dependencies [dc1f21a]
- Updated dependencies [eea3afa]
  - @felte/core@1.0.0-next.12

## 1.0.0-next.14

### Patch Changes

- 38fbb49: Point "browser" field to esm bundle
- Updated dependencies [38fbb49]
  - @felte/core@1.0.0-next.11

## 1.0.0-next.13

### Patch Changes

- e91a298: Update peer dependencies
  - @felte/core@1.0.0-next.10

## 1.0.0-next.12

### Patch Changes

- 46b05e3: Fix when publishing as modules
- Updated dependencies [46b05e3]
  - @felte/core@1.0.0-next.9

## 1.0.0-next.11

### Patch Changes

- e49c094: Use `preserveModules` for better tree-shaking
- Updated dependencies [e49c094]
  - @felte/core@1.0.0-next.8

## 1.0.0-next.10

### Patch Changes

- 0d98ecf: Set initial value on first subscription to prevent re-renders

## 1.0.0-next.9

### Patch Changes

- 47500c9: Use ref for form instead of state callback

## 1.0.0-next.8

### Patch Changes

- 62ceb3f: Fix hot module reloading
- Updated dependencies [62ceb3f]
  - @felte/core@1.0.0-next.7

## 1.0.0-next.7

### Patch Changes

- 2e1e006: Fix `stop is not a function` when using hmr

## 1.0.0-next.6

### Minor Changes

- f9b9125: Add `feltesuccess` and `felteerror` events
- 96c3c18: Add default submit handler

### Patch Changes

- f71f2c5: Fix equality checker for files
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
- 2c0f874: Make type of helpers and stores looser when using a transform function

### Minor Changes

- bee83f1: Export `useAccessor`
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
