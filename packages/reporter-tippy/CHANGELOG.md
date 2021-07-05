# @felte/reporter-tippy

## 0.3.3

### Patch Changes

- Updated dependencies [8049209]
  - @felte/common@0.4.7

## 0.3.2

### Patch Changes

- Updated dependencies [fc42f8d]
  - @felte/common@0.4.6

## 0.3.1

### Patch Changes

- 56ee618: Refactor to use getPath from `@felte/common`
- Updated dependencies [56ee618]
  - @felte/common@0.4.5

## 0.3.0

### Minor Changes

- 230e76d: Support array inputs

### Patch Changes

- Updated dependencies [230e76d]
  - @felte/common@0.4.0

## 0.2.9

### Patch Changes

- a6acca7: Fix nested custom controls

## 0.2.8

### Patch Changes

- 7f0eb9a: Fix handling of DOM mutations
- d362670: Export package.json
- Updated dependencies [3343a02]
  - @felte/common@0.3.7

## 0.2.7

### Patch Changes

- f10e84b: Add exports map

## 0.2.6

### Patch Changes

- 76fc715: Mark as side-effect free

## 0.2.5

### Patch Changes

- 3f68e48: Fix position not working on nested forms

## 0.2.4

### Patch Changes

- 55c1f90: Remove lodash dependency
- Updated dependencies [55c1f90]
- Updated dependencies [99354f1]
  - @felte/common@0.3.4

## 0.2.3

### Patch Changes

- 3c8115b: Fix reporter not working with nested forms

## 0.2.2

### Patch Changes

- 1160cd3: Allow to use reporter on custom controls
- 1160cd3: Allow to set custom position element for tippy
- 4183fcc: Allow to pass props per field with tippyPropsMap
- 4183fcc: Pass path as second argument to setContent
- Updated dependencies [5df429d]
  - @felte/common@0.3.3

## 0.2.1

### Patch Changes

- 8469780: Allow for a field to be ignored

## 0.2.0

### Minor Changes

- f87a55c: BREAKING: The exported reporter is now a function that accepts options. This allows to pass options to tippy, as well as adds a `setContent` function as an option to dynamically modify Tippy's content to allow for HTML content to be displayed.

## 0.1.14

### Patch Changes

- Updated dependencies [52f9043]
  - @felte/common@0.3.0

## 0.1.13

### Patch Changes

- d0c60d1: Prevent flash when tippy is being removed
- Updated dependencies [a664ef3]
  - @felte/common@0.2.3

## 0.1.12

### Patch Changes

- c747986: Bump dependency
- Updated dependencies [c747986]
  - @felte/common@0.2.2

## 0.1.11

### Patch Changes

- 84606cf: Fix minor bugs found while testing

## 0.1.10

### Patch Changes

- Updated dependencies [f09b65b]
  - @felte/common@0.2.0

## 0.1.9

### Patch Changes

- ac44dca: Add aria-live attribute to error container

## 0.1.8

### Patch Changes

- 1879cf0: Set aria-invalid on error

## 0.1.7

### Patch Changes

- 1f726c2: Enable tippy before calling 'show'

## 0.1.6

### Patch Changes

- Call reporters on component initialization
- Updated dependencies [undefined]
  - @felte/common@0.1.4

## 0.1.5

### Patch Changes

- bca2c8e: Change format exported from CJS to UMD
- Updated dependencies [bca2c8e]
  - @felte/common@0.1.3

## 0.1.4

### Patch Changes

- d9f73e5: Removes most of lodash dependencies for functionality in @felte/common and adds @felte/reporter-dom
- Updated dependencies [d9f73e5]
  - @felte/common@0.1.2
