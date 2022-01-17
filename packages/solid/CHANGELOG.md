# @felte/solid

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
- 334c530: BREAKING: `data`, `errors`, `warnings` and `touched` are no longer stores but accessors
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

## 0.3.0

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

## 0.2.7

### Patch Changes

- 4b637d0: Add `setInitialValues` helper and `isDirty` store
- Updated dependencies [4b637d0]
- Updated dependencies [5d7b58d]
  - @felte/core@0.2.7

## 0.2.6

### Patch Changes

- Updated dependencies [e324a45]
  - @felte/core@0.2.6

## 0.2.5

### Patch Changes

- Updated dependencies [1807c09]
  - @felte/core@0.2.5

## 0.2.4

### Patch Changes

- 14b3645: Add `transform` feature
- Updated dependencies [14b3645]
  - @felte/core@0.2.4

## 0.2.3

### Patch Changes

- Updated dependencies [3dcfe7c]
  - @felte/core@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies [e1afd46]
  - @felte/core@0.2.2

## 0.2.1

### Patch Changes

- 096f9a5: Pass a `context` to `onSubmit` calls
- f79c67f: Listen to programmatic changes of inputs
- Updated dependencies [096f9a5]
- Updated dependencies [f79c67f]
  - @felte/core@0.2.1

## 0.2.0

### Minor Changes

- 2d3b213: BREAKING: Remove `reporter` configuration option in favor of `extend`.

### Patch Changes

- Updated dependencies [2d3b213]
- Updated dependencies [de71f43]
  - @felte/core@0.2.0

## 0.1.9

### Patch Changes

- 5bb4a02: Add data-felte-ignore attribute to make Felte completely ignore an input
- Updated dependencies [5bb4a02]
  - @felte/core@0.1.6

## 0.1.8

### Patch Changes

- Updated dependencies [6b8aafb]
  - @felte/core@0.1.5

## 0.1.7

### Patch Changes

- 16ff018: Export ES module as default
- Updated dependencies [16ff018]
  - @felte/core@0.1.4

## 0.1.6

### Patch Changes

- e6034c0: Use `Record<string, any>` for config type in order to allow interfaces to be passed as types
- Updated dependencies [e6034c0]
  - @felte/core@0.1.3

## 0.1.5

### Patch Changes

- Updated dependencies [8049209]
  - @felte/core@0.1.2

## 0.1.4

### Patch Changes

- 4e28835: Fix isValid setter

## 0.1.3

### Patch Changes

- 3118b72: Use @felte/core instead of @felte/common

## 0.1.2

### Patch Changes

- Fix store behaviour on multi inputs

## 0.1.1

### Patch Changes

- Fix issues due to mutability of common functions
- Updated dependencies [undefined]
  - @felte/core@0.1.1

## 0.1.0

### Minor Changes

- 809f9af: Refactor to use a common core
- 809f9af: Add SolidJS wrapper

### Patch Changes

- Updated dependencies [809f9af]
  - @felte/core@0.1.0
