# @felte/core

## 1.3.4

### Patch Changes

- 686907b: Fixes error where removing and adding nodes at the same time can cause coordination issues

## 1.3.3

### Patch Changes

- Updated dependencies [61679da]
- Updated dependencies [61679da]
  - @felte/common@1.1.2

## 1.3.2

### Patch Changes

- ab24c7e: Send `Accept` headers on default submit handler

## 1.3.1

### Patch Changes

- 1386ac3: update `isValidating` on debounced validators
- Updated dependencies [1386ac3]
  - @felte/common@1.1.1

## 1.3.0

### Minor Changes

- 72f5389: Pass all stores, `createSubmitHandler` and `handleSubmit` to extenders

### Patch Changes

- Updated dependencies [72f5389]
  - @felte/common@1.1.0

## 1.2.5

### Patch Changes

- Updated dependencies [32028b1]
  - @felte/common@1.0.4

## 1.2.4

### Patch Changes

- d9e7b12: Stop bundling core/common packages to allow for code reusability

## 1.2.3

### Patch Changes

- 9b49b35: Remove hidden input on unmount and handle possible race conditions

## 1.2.2

### Patch Changes

- aa6483d: Improve performance when using dynamic fields
- aa6483d: Debounce calls to extenders on MutationObserver
- Updated dependencies [aa6483d]
- Updated dependencies [aa6483d]
  - @felte/common@1.0.3

## 1.2.1

### Patch Changes

- 1c88b92: Fix name of reset function of createField

## 1.2.0

### Minor Changes

- fd58a47: Add `onReset` to `createField`

## 1.1.1

### Patch Changes

- 03b9e01: Stop using CustomEvent for compatibility with Node
- 6dafd80: Fix breakage on SSR

## 1.1.0

### Minor Changes

- c00d0e1: Add FelteSubmitEvent and allow to set errors on FelteErrorEvent

  Fixes bug where errors failed silently on submit

### Patch Changes

- c00d0e1: Allow onError to return partial errors
- Updated dependencies [c00d0e1]
- Updated dependencies [c00d0e1]
  - @felte/common@1.0.2

## 1.0.1

### Patch Changes

- 9b492e0: Fix handling of `<select multiple>` elements
- Updated dependencies [9b492e0]
  - @felte/common@1.0.1

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
  addValidator(yourValidationFunction, { level: 'warning' });
  ```

- b007b7f: Pass a new property `stage` to extenders to distinguish between setup, mount and update stages
- b007b7f: BREAKING: Helpers have been completely reworked.
  `setField` and `setFields` have been unified in a single `setFields` helper.
  Others such as `setError` and `setWarning` have been pluralized to `setErrors` and `setWarnings` since now they can accept the whole object.
  `setTouched` now requires to be passed the value to assign. E.g. `setTouched('path')` is now `setTouched('path', true)`. It no longer accepts an index as an argument since that can be assigned in the path itself using `[]`.
- b007b7f: BREAKING: Remove `getField` helper in favor of `getValue` export. E.g. `getField('email')` now is `getValue($data, 'email')` and accessors.
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
- b007b7f: Change responsibility for adding `aria-invalid` to fields to `@felte/core`
- b007b7f: Improve types
- b007b7f: Add isValidating store
- b007b7f: Add `feltesuccess` and `felteerror` events
- b007b7f: Update types
- b007b7f: Make string paths for accessors type safe
- b007b7f: Add helper functions to context passed to `onSuccess`, `onSubmit` and `onError`
- b007b7f: Add `interacted` store to show which is the last field the user has interacted with
- b007b7f: Add isValidating store
- b007b7f: Add `swapFields` and `moveField` helper functions
- b007b7f: Add default submit handler
- b007b7f: Add `unsetField` and `resetField` helper functions
- b007b7f: Add support for custom controls with `createField`
- b007b7f: Add unique key to field arrays
- b007b7f: Pass context data to `onError` and `onSuccess`
- b007b7f: Add debounced validators

### Patch Changes

- b007b7f: Fix hot module reloading
- b007b7f: Fix some values disappearing from DOM when removing a field from an array
- b007b7f: Fix unset on Safari
- b007b7f: Point "browser" field to esm bundle
- b007b7f: Fix when publishing as modules
- b007b7f: Unset also `touched`, `warnings` and `errors` stores when fields are marked for removal
- b007b7f: Use `preserveModules` for better tree-shaking
- b007b7f: Add type for keyed Data
- b007b7f: Calls `reset` helper when a `reset` event is dispatched by the form (e.g. when using a `button[type="reset"]`
- b007b7f: Export events as types
- b007b7f: Wait for DOM element to be mounted on createField/useField
- b007b7f: Prevent key assignment to errors and touched stores
- b007b7f: Fix error filtering
- b007b7f: Change cjs output to have an extension of `.cjs`
- b007b7f: Allow for `onError` and `onSuccess` to be asynchronous
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
  - @felte/common@1.0.0

## 1.0.0-next.27

### Patch Changes

- Updated dependencies [7f3d8b8]
  - @felte/common@1.0.0-next.23

## 1.0.0-next.26

### Patch Changes

- 4853b7e: Change cjs output to have an extension of `.cjs`
- Updated dependencies [4853b7e]
  - @felte/common@1.0.0-next.22

## 1.0.0-next.25

### Minor Changes

- fcbdaed: Add `swapFields` and `moveField` helper functions

### Patch Changes

- Updated dependencies [fcbdaed]
  - @felte/common@1.0.0-next.21

## 1.0.0-next.24

### Minor Changes

- 990034e: Add `interacted` store to show which is the last field the user has interacted with
- 0faaa8f: Add isValidating store

### Patch Changes

- 5c71750: Calls `reset` helper when a `reset` event is dispatched by the form (e.g. when using a `button[type="reset"]`
- Updated dependencies [990034e]
  - @felte/common@1.0.0-next.20

## 1.0.0-next.23

### Patch Changes

- 8282a70: Wait for DOM element to be mounted on createField/useField

## 1.0.0-next.22

### Minor Changes

- b9ea48d: Add support for custom controls with `createField`

### Patch Changes

- Updated dependencies [a174e87]
  - @felte/common@1.0.0-next.19

## 1.0.0-next.21

### Patch Changes

- 0b38b98: Prevent key assignment to errors and touched stores
- Updated dependencies [70cfada]
  - @felte/common@1.0.0-next.18

## 1.0.0-next.20

### Patch Changes

- 2e7aad3: Fix some values disappearing from DOM when removing a field from an array
- 2e7aad3: Add type for keyed Data
- Updated dependencies [2e7aad3]
  - @felte/common@1.0.0-next.17

## 1.0.0-next.19

### Minor Changes

- c8c1511: Add unique key to field arrays

### Patch Changes

- Updated dependencies [c8c1511]
  - @felte/common@1.0.0-next.16

## 1.0.0-next.18

### Major Changes

- 093482a: BREAKING: Setting directly to `data` using `data.set` no longer touches the field. The `setFields` helper should be used instead if this behaviour is desired.

### Minor Changes

- 093482a: Add isValidating store

### Patch Changes

- Updated dependencies [093482a]
  - @felte/common@1.0.0-next.15

## 1.0.0-next.17

### Patch Changes

- dd52c94: Fix error filtering
- Updated dependencies [dd52c94]
  - @felte/common@1.0.0-next.14

## 1.0.0-next.16

### Major Changes

- a45d56c: BREAKING: `errors` and `warning` stores will either have `null` or an array of strings as errors

### Patch Changes

- Updated dependencies [a45d56c]
  - @felte/common@1.0.0-next.13

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
  - @felte/common@1.0.0-next.12

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
- ec740a0: Update types
- 34e0393: Make string paths for accessors type safe
- 477bb45: Add debounced validators

### Patch Changes

- Updated dependencies [a1dbc28]
- Updated dependencies [ec740a0]
- Updated dependencies [34e0393]
- Updated dependencies [b7ef442]
- Updated dependencies [e1ad8cd]
  - @felte/common@1.0.0-next.11

## 1.0.0-next.13

### Patch Changes

- f315439: Export events as types

## 1.0.0-next.12

### Minor Changes

- dc1f21a: Add helper functions to context passed to `onSuccess`, `onSubmit` and `onError`
- eea3afa: Pass context data to `onError` and `onSuccess`

### Patch Changes

- Updated dependencies [dc1f21a]
- Updated dependencies [eea3afa]
  - @felte/common@1.0.0-next.10

## 1.0.0-next.11

### Patch Changes

- 38fbb49: Point "browser" field to esm bundle
- Updated dependencies [38fbb49]
  - @felte/common@1.0.0-next.9

## 1.0.0-next.10

### Patch Changes

- Updated dependencies [c86a82a]
  - @felte/common@1.0.0-next.8

## 1.0.0-next.9

### Patch Changes

- 46b05e3: Fix when publishing as modules

## 1.0.0-next.8

### Patch Changes

- e49c094: Use `preserveModules` for better tree-shaking
- Updated dependencies [e49c094]
  - @felte/common@1.0.0-next.7

## 1.0.0-next.7

### Patch Changes

- 62ceb3f: Fix hot module reloading

## 1.0.0-next.6

### Minor Changes

- f9b9125: Add `feltesuccess` and `felteerror` events
- 96c3c18: Add default submit handler

### Patch Changes

- d1b62bf: Allow for `onError` and `onSuccess` to be asynchronous
- Updated dependencies [d1b62bf]
  - @felte/common@1.0.0-next.6

## 1.0.0-next.5

### Patch Changes

- Updated dependencies [e2f4e18]
  - @felte/common@1.0.0-next.5

## 1.0.0-next.4

### Patch Changes

- 8c29b4a: Fix unset on Safari
- Updated dependencies [8c29b4a]
  - @felte/common@1.0.0-next.3

## 1.0.0-next.3

### Minor Changes

- 6f48123: Add `addField` helper function

### Patch Changes

- Updated dependencies [6f48123]
  - @felte/common@1.0.0-next.2

## 1.0.0-next.2

### Major Changes

- 77de471: BREAKING: Stop proxying inputs. This was causing all sorts of race conditions which were a headache to solve. Instead we're going to keep a single recommendation: If you wish to programatically set the value of an input, use the `setFields` helper.
- 02a77e3: BREAKING: When removing an input from an array of inputs, Felte now splices the array instead of setting the value to `null`/`undefined`. This means that an `index` on an array of inputs is no longer a _unique_ identifier and the value can move around if fields are added/removed.

### Patch Changes

- Updated dependencies [02a77e3]
  - @felte/common@1.0.0-next.1

## 1.0.0-next.0

### Major Changes

- a2ea0b2: BREAKING: `setFields` no longer touches a field by default. It needs to be explicit and it's only possible when passing a string path. E.g. `setField(‘email’ , 'zaphod@beeblebrox.com')` now is `setFields('email', 'zaphod@beeblebrox.com', true)`.
- 1dd68e7: BREAKING: Remove `data-felte-unset-on-remove` in favour of `data-felte-keep-on-remove`. Felte will now remove fields by default if removed from the DOM.

  To keep the same behaviour as before, add `data-felte-keep-on-remove` to any dynamic inputs you had that didn't have `data-felte-unset-on-remove` previously. And remove `data-felte-unset-on-remove` from the inputs that had it, or replace it for `data-felte-keep-on-remove="false"` if it was used to override a parent's attribute.

- 6109533: BREAKING: apply transforms to initialValues
- 9a48a40: Pass a new property `stage` to extenders to distinguish between setup, mount and update stages
- 0d22bc6: BREAKING: Helpers have been completely reworked.
  `setField` and `setFields` have been unified in a single `setFields` helper.
  Others such as `setError` and `setWarning` have been pluralized to `setErrors` and `setWarnings` since now they can accept the whole object.
  `setTouched` now requires to be passed the value to assign. E.g. `setTouched('path')` is now `setTouched('path', true)`. It no longer accepts an index as an argument since that can be assigned in the path itself using `[]`.
- 3d571bb: BREAKING: Remove `getField` helper in favor of `getValue` export. E.g. `getField('email')` now is `getValue($data, 'email')` and accessors.
- 2c0f874: Make type of helpers and stores looser when using a transform function

### Minor Changes

- 1bc036e: Change responsibility for adding `aria-invalid` to fields to `@felte/core`
- c1f32a0: Add `unsetField` and `resetField` helper functions

### Patch Changes

- 6431ee4: Unset also `touched`, `warnings` and `errors` stores when fields are marked for removal
- Updated dependencies [9a48a40]
- Updated dependencies [0d22bc6]
- Updated dependencies [3d571bb]
- Updated dependencies [c1f32a0]
- Updated dependencies [2c0f874]
  - @felte/common@1.0.0-next.0

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
