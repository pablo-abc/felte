# @felte/validator-vest

## 1.0.17

### Patch Changes

- 7c3dffc: Fix typescript issues
- Updated dependencies [7c3dffc]
  - @felte/common@1.1.9

## 1.0.16

### Patch Changes

- Updated dependencies [0a99410]
  - @felte/common@1.1.8

## 1.0.15

### Patch Changes

- Updated dependencies [ffdee29]
  - @felte/common@1.1.7

## 1.0.14

### Patch Changes

- Updated dependencies [100b17c]
  - @felte/common@1.1.6

## 1.0.13

### Patch Changes

- d6144a4: Add "types" to package.json "exports" field
- Updated dependencies [d6144a4]
  - @felte/common@1.1.5

## 1.0.12

### Patch Changes

- 5e784f8: Upgrade to node@18
- Updated dependencies [5e784f8]
  - @felte/common@1.1.4

## 1.0.11

### Patch Changes

- Updated dependencies [8ef7866]
- Updated dependencies [22bfa3b]
  - @felte/common@1.1.3

## 1.0.10

### Patch Changes

- Updated dependencies [61679da]
- Updated dependencies [61679da]
  - @felte/common@1.1.2

## 1.0.9

### Patch Changes

- Updated dependencies [1386ac3]
  - @felte/common@1.1.1

## 1.0.8

### Patch Changes

- Updated dependencies [72f5389]
  - @felte/common@1.1.0

## 1.0.7

### Patch Changes

- 43e1376: Add "files" field to package.json

## 1.0.6

### Patch Changes

- Updated dependencies [32028b1]
  - @felte/common@1.0.4

## 1.0.5

### Patch Changes

- d9e7b12: Stop bundling core/common packages to allow for code reusability

## 1.0.4

### Patch Changes

- 9979d5f: Fix asynchronous tests

## 1.0.3

### Patch Changes

- Updated dependencies [aa6483d]
- Updated dependencies [aa6483d]
  - @felte/common@1.0.3

## 1.0.2

### Patch Changes

- Updated dependencies [c00d0e1]
- Updated dependencies [c00d0e1]
  - @felte/common@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [9b492e0]
  - @felte/common@1.0.1

## 1.0.0

### Major Changes

- b007b7f: BREAKING: instead of extending Felte's config, now validators accept a configuration object directly. This allows for extending Felte with multiple schemas/suites/structs
- b007b7f: BREAKING: Remove `addWarnValidator` in favour of options to `addValidator`.

  This gives a smaller and more unified API, as well as opening to add more options in the future.

  If you have an extender using `addWarnValidator`, you must update it by calling `addValidator` instead with the following options:

  ```javascript
  addValidator(yourValidationFunction, { level: "warning" });
  ```

- b007b7f: Pass a new property `stage` to extenders to distinguish between setup, mount and update stages

### Patch Changes

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

## 1.0.0-next.22

### Patch Changes

- Updated dependencies [7f3d8b8]
  - @felte/common@1.0.0-next.23

## 1.0.0-next.21

### Patch Changes

- 4853b7e: Change cjs output to have an extension of `.cjs`
- Updated dependencies [4853b7e]
  - @felte/common@1.0.0-next.22

## 1.0.0-next.20

### Patch Changes

- Updated dependencies [fcbdaed]
  - @felte/common@1.0.0-next.21

## 1.0.0-next.19

### Patch Changes

- Updated dependencies [990034e]
  - @felte/common@1.0.0-next.20

## 1.0.0-next.18

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

### Major Changes

- 313aa5d: BREAKING: instead of extending Felte's config, now validators accept a configuration object directly. This allows for extending Felte with multiple schemas/suites/structs

### Patch Changes

- Updated dependencies [a45d56c]
  - @felte/common@1.0.0-next.13

## 1.0.0-next.11

### Patch Changes

- Updated dependencies [452fe5a]
- Updated dependencies [15d0ce2]
  - @felte/common@1.0.0-next.12

## 1.0.0-next.10

### Major Changes

- b7ef442: BREAKING: Remove `addWarnValidator` in favour of options to `addValidator`.

  This gives a smaller and more unified API, as well as opening to add more options in the future.

  If you have an extender using `addWarnValidator`, you must update it by calling `addValidator` instead with the following options:

  ```javascript
  addValidator(yourValidationFunction, { level: "warning" });
  ```

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

### Patch Changes

- Updated dependencies [9a48a40]
- Updated dependencies [0d22bc6]
- Updated dependencies [3d571bb]
- Updated dependencies [c1f32a0]
- Updated dependencies [2c0f874]
  - @felte/common@1.0.0-next.0

## 0.1.0

### Minor Changes

- Use the released version of Vest V4

## 0.0.5

### Patch Changes

- 3324788: Add support for warnings

## 0.0.4

### Patch Changes

- 6fe19bf: Change build output from umd to cjs, since Felte is not planned to be used as a global import, a umd build is not necessary.
- Updated dependencies [6fe19bf]
- Updated dependencies [6fe19bf]
- Updated dependencies [6fe19bf]
  - @felte/common@0.6.0

## 0.0.3

### Patch Changes

- Updated dependencies [4b637d0]
- Updated dependencies [5d7b58d]
  - @felte/common@0.5.4

## 0.0.2

### Patch Changes

- Updated dependencies [e324a45]
  - @felte/common@0.5.3
