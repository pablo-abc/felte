# @felte/element

## 0.5.14

### Patch Changes

- 7c3dffc: Fix typescript issues
- Updated dependencies [7c3dffc]
  - @felte/core@1.4.4

## 0.5.13

### Patch Changes

- Updated dependencies [595c09c]
  - @felte/core@1.4.3

## 0.5.12

### Patch Changes

- Updated dependencies [2e25206]
  - @felte/core@1.4.2

## 0.5.11

### Patch Changes

- 0a99410: Fix dynamically added number input not validating unless touched
- Updated dependencies [0a99410]
  - @felte/core@1.4.1

## 0.5.10

### Patch Changes

- Updated dependencies [6735209]
- Updated dependencies [ffdee29]
  - @felte/core@1.4.0

## 0.5.9

### Patch Changes

- @felte/core@1.3.9

## 0.5.8

### Patch Changes

- d6144a4: Add "types" to package.json "exports" field
- Updated dependencies [d6144a4]
  - @felte/core@1.3.8

## 0.5.7

### Patch Changes

- 5e784f8: Upgrade to node@18
- Updated dependencies [5e784f8]
- Updated dependencies [95c5e1b]
  - @felte/core@1.3.7

## 0.5.6

### Patch Changes

- 5a88603: add custom-elements.json manifest
- Updated dependencies [2e109f9]
  - @felte/core@1.3.6

## 0.5.5

### Patch Changes

- 8ef7866: Stop grabbing store types from `svelte/store`
- Updated dependencies [8ef7866]
  - @felte/core@1.3.5

## 0.5.4

### Patch Changes

- Updated dependencies [686907b]
  - @felte/core@1.3.4

## 0.5.3

### Patch Changes

- @felte/core@1.3.3

## 0.5.2

### Patch Changes

- Updated dependencies [ab24c7e]
  - @felte/core@1.3.2

## 0.5.1

### Patch Changes

- Updated dependencies [1386ac3]
  - @felte/core@1.3.1

## 0.5.0

### Minor Changes

- 72f5389: Pass all stores, `createSubmitHandler` and `handleSubmit` to extenders

### Patch Changes

- Updated dependencies [72f5389]
  - @felte/core@1.3.0

## 0.4.3

### Patch Changes

- 2530072: Fix module exports

## 0.4.2

### Patch Changes

- @felte/core@1.2.5

## 0.4.1

### Patch Changes

- d9e7b12: Stop bundling core/common packages to allow for code reusability
- Updated dependencies [d9e7b12]
  - @felte/core@1.2.4

## 0.4.0

### Minor Changes

- 589bb34: BREAKING: Move side effects to `@felte/element/felte-form` and `@felte/element/felte-field`

## 0.3.2

### Patch Changes

- a39ca69: Don't set default id (it was causing a default attribute of `[id=""]`)
- 34230fe: Add `target` attribute to get field from a custom selector

## 0.3.1

### Patch Changes

- 256e5b1: Handle possibility of child elements changing
- Updated dependencies [9b49b35]
  - @felte/core@1.2.3

## 0.3.0

### Minor Changes

- ddb734f: BREAKING: Update casing of event handler functions

## 0.2.6

### Patch Changes

- Updated dependencies [aa6483d]
- Updated dependencies [aa6483d]
  - @felte/core@1.2.2

## 0.2.5

### Patch Changes

- 1c88b92: Fix name of reset function of createField
- Updated dependencies [1c88b92]
  - @felte/core@1.2.1

## 0.2.4

### Patch Changes

- 4bea95a: Add `composed` attribute to `felte-field`
- fd58a47: Add support for `reset` event
- Updated dependencies [fd58a47]
  - @felte/core@1.2.0

## 0.2.3

### Patch Changes

- 456b287: Move to vanilla custom elements to reduce bundle size

## 0.2.2

### Patch Changes

- 23efb6a: Fix `prepareForm` execution

## 0.2.1

### Patch Changes

- Updated dependencies [03b9e01]
- Updated dependencies [6dafd80]
  - @felte/core@1.1.1

## 0.2.0

### Minor Changes

- c00d0e1: Add felte-field element
- c00d0e1: Add FelteSubmitEvent and allow to set errors on FelteErrorEvent

  Fixes bug where errors failed silently on submit

### Patch Changes

- c00d0e1: Allow onError to return partial errors
- Updated dependencies [c00d0e1]
- Updated dependencies [c00d0e1]
  - @felte/core@1.1.0
