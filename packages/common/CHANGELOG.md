# @felte/common

## 0.4.8

### Patch Changes

- af4b183: fix falsy initial values are ignored
- e6034c0: Use `Record<string, any>` for config type in order to allow interfaces to be passed as types

## 0.4.7

### Patch Changes

- 8049209: Fix Felte not removing the field from the data store when the input has a fieldset and the fieldset is not removed alongside the input.

## 0.4.6

### Patch Changes

- fc42f8d: Fix getPath

## 0.4.5

### Patch Changes

- 56ee618: Refactor to use getPath from `@felte/common`

## 0.4.4

### Patch Changes

- Fix issues due to mutability of common functions

## 0.4.3

### Patch Changes

- c31e1cc: Fix select element being validate on start

## 0.4.2

### Patch Changes

- d20c7b8: Fixed initialValues not being set for select and textarea elements

## 0.4.1

### Patch Changes

- 04fd142: Fix adding from array not adding defautl value

## 0.4.0

### Minor Changes

- 230e76d: Handle inputs generated with an array

## 0.3.7

### Patch Changes

- 3343a02: Fix touched handling for custom controls

## 0.3.6

### Patch Changes

- aabce0d: Add require exports

## 0.3.5

### Patch Changes

- d2d79cb: Make package tree shakeable

## 0.3.4

### Patch Changes

- 55c1f90: Remove lodash dependency
- 99354f1: Removes merge and mergeWith dependency from lodash

## 0.3.3

### Patch Changes

- 5df429d: Fix \_get not being able to retrieve objects

## 0.3.2

### Patch Changes

- f5c7cdf: Fix issue where NaN was being parsed as 0 in an `input[type=number]`

## 0.3.1

### Patch Changes

- f5a52e1: Return `setFields` function from `createForm` to set all fields of the form

## 0.3.0

### Minor Changes

- 52f9043: Allow `validate` configuration option to be an array of functions

## 0.2.4

### Patch Changes

- 53e5278: Pass config object to extender

## 0.2.3

### Patch Changes

- a664ef3: Update types to allow validator to return undefined

## 0.2.2

### Patch Changes

- d7d43d3: Fix minor bugs found while testing

## 0.2.0

### Minor Changes

- f09b65b: BREAKING: `reporter` renamed to `extend` since its current API can be used to extende Felte's behaviour freely

## 0.1.6

### Patch Changes

- bace787: Add createSubmitHandler helper function to allow to override submit handler

## 0.1.5

### Patch Changes

- 1c6017f: Add `reset` helper function that resets the whole form to its original values
- 8a50ad7: Add a `validate` helper function to force validation of the whole form

## 0.1.4

### Patch Changes

- Call reporters on component initialization

## 0.1.3

### Patch Changes

- bca2c8e: Change format exported from CJS to UMD

## 0.1.2

### Patch Changes

- d9f73e5: Removes most of lodash dependencies for functionality in @felte/common and adds @felte/reporter-dom
