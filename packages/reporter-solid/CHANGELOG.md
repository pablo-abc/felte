# @felte/reporter-solid

## 1.0.0-next.11

### Major Changes

- 998ed45: BREAKING: Remove `index` prop support

  This was done in order to allow and simplify further improvements of the type system.

  This means this:

  ```html
  <ValidationMessage index="1" for="email"></ValidationMessage>
  ```

  Should be changed to this:

  ```html
  <ValidationMessage for="email.1"></ValidationMessage>
  ```

### Patch Changes

- Updated dependencies [452fe5a]
- Updated dependencies [15d0ce2]
  - @felte/common@1.0.0-next.12

## 1.0.0-next.10

### Patch Changes

- Updated dependencies [a1dbc28]
- Updated dependencies [ec740a0]
- Updated dependencies [34e0393]
- Updated dependencies [b7ef442]
- Updated dependencies [e1ad8cd]
  - @felte/common@1.0.0-next.11

## 1.0.0-next.9

### Patch Changes

- Updated dependencies [dc1f21a]
- Updated dependencies [eea3afa]
  - @felte/common@1.0.0-next.10

## 1.0.0-next.8

### Patch Changes

- Updated dependencies [38fbb49]
  - @felte/common@1.0.0-next.9

## 1.0.0-next.7

### Patch Changes

- Updated dependencies [c86a82a]
  - @felte/common@1.0.0-next.8

## 1.0.0-next.6

### Patch Changes

- Updated dependencies [e49c094]
  - @felte/common@1.0.0-next.7

## 1.0.0-next.5

### Patch Changes

- Updated dependencies [d1b62bf]
  - @felte/common@1.0.0-next.6

## 1.0.0-next.4

### Patch Changes

- Updated dependencies [e2f4e18]
  - @felte/common@1.0.0-next.5

## 1.0.0-next.3

### Patch Changes

- Updated dependencies [8c29b4a]
  - @felte/common@1.0.0-next.3

## 1.0.0-next.2

### Patch Changes

- Updated dependencies [6f48123]
  - @felte/common@1.0.0-next.2

## 1.0.0-next.1

### Patch Changes

- Updated dependencies [02a77e3]
  - @felte/common@1.0.0-next.1

## 1.0.0-next.0

### Major Changes

- 9a48a40: Pass a new property `stage` to extenders to distinguish between setup, mount and update stages
- 2c0f874: Make type of helpers and stores looser when using a transform function

### Minor Changes

- 1bc036e: Change responsibility for adding `aria-invalid` to fields to `@felte/core`
- 0c01eab: Add `level` prop to select from which store to obtain validation message. Possible values: `'error' | 'warning'`

### Patch Changes

- Updated dependencies [9a48a40]
- Updated dependencies [0d22bc6]
- Updated dependencies [3d571bb]
- Updated dependencies [c1f32a0]
- Updated dependencies [2c0f874]
  - @felte/common@1.0.0-next.0

## 0.1.14

### Patch Changes

- Updated dependencies [6fe19bf]
- Updated dependencies [6fe19bf]
- Updated dependencies [6fe19bf]
  - @felte/common@0.6.0

## 0.1.13

### Patch Changes

- 4b637d0: Fix ValidationMessage not receiving messages
- Updated dependencies [4b637d0]
- Updated dependencies [5d7b58d]
  - @felte/common@0.5.4

## 0.1.12

### Patch Changes

- Updated dependencies [e324a45]
  - @felte/common@0.5.3

## 0.1.11

### Patch Changes

- Updated dependencies [14b3645]
  - @felte/common@0.5.2

## 0.1.10

### Patch Changes

- aaaf03f: Update build dependency
- Updated dependencies [096f9a5]
  - @felte/common@0.5.1

## 0.1.9

### Patch Changes

- Updated dependencies [a7e7e35]
- Updated dependencies [2d3b213]
- Updated dependencies [de71f43]
  - @felte/common@0.5.0

## 0.1.8

### Patch Changes

- Updated dependencies [5bb4a02]
  - @felte/common@0.4.10

## 0.1.7

### Patch Changes

- Updated dependencies [16ff018]
  - @felte/common@0.4.9

## 0.1.6

### Patch Changes

- 14bf9d8: Update to use only JS features compatible with Bundlephobia

## 0.1.5

### Patch Changes

- Updated dependencies [af4b183]
- Updated dependencies [e6034c0]
  - @felte/common@0.4.8

## 0.1.4

### Patch Changes

- Updated dependencies [8049209]
  - @felte/common@0.4.7

## 0.1.3

### Patch Changes

- cb83dee: Fix index fields

## 0.1.2

### Patch Changes

- Updated dependencies [fc42f8d]
  - @felte/common@0.4.6

## 0.1.1

### Patch Changes

- 56ee618: Refactor to use getPath from `@felte/common`
- Updated dependencies [56ee618]
  - @felte/common@0.4.5

## 0.1.0

### Minor Changes

- 3feb1f8: Add `@felte/reporter-solid` package
