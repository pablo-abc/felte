# @felte/react

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
