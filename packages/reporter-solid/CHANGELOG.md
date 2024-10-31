# @felte/reporter-solid

## 1.2.11

### Patch Changes

- Updated dependencies [7c3dffc]
  - @felte/common@1.1.9

## 1.2.10

### Patch Changes

- e9e71fd: Support solid-start

## 1.2.9

### Patch Changes

- Updated dependencies [0a99410]
  - @felte/common@1.1.8

## 1.2.8

### Patch Changes

- Updated dependencies [ffdee29]
  - @felte/common@1.1.7

## 1.2.7

### Patch Changes

- Updated dependencies [100b17c]
  - @felte/common@1.1.6

## 1.2.6

### Patch Changes

- d6144a4: Add "types" to package.json "exports" field
- Updated dependencies [d6144a4]
  - @felte/common@1.1.5

## 1.2.5

### Patch Changes

- 5e784f8: Upgrade to node@18
- Updated dependencies [5e784f8]
  - @felte/common@1.1.4

## 1.2.4

### Patch Changes

- Updated dependencies [8ef7866]
- Updated dependencies [22bfa3b]
  - @felte/common@1.1.3

## 1.2.3

### Patch Changes

- Updated dependencies [61679da]
- Updated dependencies [61679da]
  - @felte/common@1.1.2

## 1.2.2

### Patch Changes

- Updated dependencies [1386ac3]
  - @felte/common@1.1.1

## 1.2.1

### Patch Changes

- Updated dependencies [72f5389]
  - @felte/common@1.1.0

## 1.2.0

### Minor Changes

- c55b7fe: Allow to prevent focus on error by passing options to the reporter

## 1.1.5

### Patch Changes

- Updated dependencies [32028b1]
  - @felte/common@1.0.4

## 1.1.4

### Patch Changes

- d9e7b12: Stop bundling core/common packages to allow for code reusability

## 1.1.3

### Patch Changes

- Updated dependencies [aa6483d]
- Updated dependencies [aa6483d]
  - @felte/common@1.0.3

## 1.1.2

### Patch Changes

- Updated dependencies [c00d0e1]
- Updated dependencies [c00d0e1]
  - @felte/common@1.0.2

## 1.1.1

### Patch Changes

- 71f4a47: Improve handling of `as` prop

## 1.1.0

### Minor Changes

- b67f646: Add `as` prop to dynamically set a component for `ValidationMessage`

## 1.0.1

### Patch Changes

- Updated dependencies [9b492e0]
  - @felte/common@1.0.1

## 1.0.0

### Major Changes

- b007b7f: BREAKING: Remove `index` prop support

  This was done in order to allow and simplify further improvements of the type system.

  This means this:

  ```html
  <ValidationMessage index="1" for="email"></ValidationMessage>
  ```

  Should be changed to this:

  ```html
  <ValidationMessage for="email.1"></ValidationMessage>
  ```

- b007b7f: Pass a new property `stage` to extenders to distinguish between setup, mount and update stages
- b007b7f: Make type of helpers and stores looser when using a transform function

### Minor Changes

- b007b7f: Change responsibility for adding `aria-invalid` to fields to `@felte/core`
- b007b7f: Add `level` prop to select from which store to obtain validation message. Possible values: `'error' | 'warning'`
- b007b7f: Ensure good behaviour with controls created by `useField`/`createField` by only focusing non-hidden inputs

### Patch Changes

- b007b7f: Fix types
- b007b7f: Apply patch from 0.1.15
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
  - @felte/common@1.0.0

## 1.0.0-next.24

### Patch Changes

- Updated dependencies [7f3d8b8]
  - @felte/common@1.0.0-next.23

## 1.0.0-next.23

### Patch Changes

- 4853b7e: Change cjs output to have an extension of `.cjs`
- Updated dependencies [4853b7e]
  - @felte/common@1.0.0-next.22

## 1.0.0-next.22

### Patch Changes

- 50638a8: Apply patch from 0.1.15

## 1.0.0-next.21

### Patch Changes

- ed1cbe3: Fix types

## 1.0.0-next.20

### Patch Changes

- Updated dependencies [fcbdaed]
  - @felte/common@1.0.0-next.21

## 1.0.0-next.19

### Patch Changes

- Updated dependencies [990034e]
  - @felte/common@1.0.0-next.20

## 1.0.0-next.18

### Minor Changes

- 02fd56e: Ensure good behaviour with controls created by `useField`/`createField` by only focusing non-hidden inputs

### Patch Changes

- Updated dependencies [a174e87]
  - @felte/common@1.0.0-next.19

## 1.0.0-next.17

### Patch Changes

- Updated dependencies [70cfada]
  - @felte/common@1.0.0-next.18

## 1.0.0-next.16

### Patch Changes

- Updated dependencies [2e7aad3]
  - @felte/common@1.0.0-next.17

## 1.0.0-next.15

### Patch Changes

- Updated dependencies [c8c1511]
  - @felte/common@1.0.0-next.16

## 1.0.0-next.14

### Patch Changes

- Updated dependencies [093482a]
  - @felte/common@1.0.0-next.15

## 1.0.0-next.13

### Patch Changes

- Updated dependencies [dd52c94]
  - @felte/common@1.0.0-next.14

## 1.0.0-next.12

### Patch Changes

- Updated dependencies [a45d56c]
  - @felte/common@1.0.0-next.13

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

## 0.1.15

### Patch Changes

- a576a95: Fix bug when hydrating on SSR. Validation messages would get rendered at the end of the parent element

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
