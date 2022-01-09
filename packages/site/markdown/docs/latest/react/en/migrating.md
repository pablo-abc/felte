---
section: Migrating
---

## Migrating from 0.x felte or @felte/solid

Since this package will be released already at 1.0.0 (the exposed API is now consistent with the rest of wrappers), this section would only make sense if you've tried Felte coming from Solid or Svelte and expect a similar API to the one previously used on those wrappers. If you're coming directly to this package, you can safely ignore this and use the documentation as reference.

### Helpers

The returned helpers have changed.
* `setField` and `setFields` are now only one function: `setFields` that accepts both signatures (and more). For example:
```javascript
setField('email', 'zaphod@beeblebrox.com`)
```
should now be
```javascript
setField('email', 'zaphod@beeblebrox.com')
```
* `setFields` does not touch a field by default. It needs to be explicit and needs a string path. E.g. `setField(‘email’ , 'zaphod@beeblebrox.com')` now is `setFields('email', 'zaphod@beeblebrox.com', true)`. For example:
```javascript
setField('email' , 'zaphod@beeblebrox.com')
```
should now be
```javascript
setFields('email', 'zaphod@beeblebrox.com', true)
```
* `setError` is now `setErrors`. Accepts either the whole error object, an updater function, a path and a value, or a path and an updater function. For example:
```javascript
setError('email', 'Not an email')
```
should now be
```javascript
setErrors('email', 'Not an email')
```
*  `setWarning` is now `setWarnings`. Accepts either the whole warnings object, an updater function, a path and a value, or a path and an updater function. For example:
```javascript
setWarning('password', 'Not secure')
```
should now be
```javascript
setWarnings('password', 'Not secure')
```
* `setTouched` now accepts either the whole warnings object, an updater function, a path and a value, or a path and an updater function. For example:
```javascript
setTouched('email')
```
should now be
```javascript
setTouched('email', true)
```
* `setTouched` no longer accepts an index as second argument, since that can be interpolated in the path. For example:
```javascript
setTouched('tag', 1)
```
should now be
```javascript
setTouched('tag[1]', true)
```

> These functions now can do more than before. Be sure to check the [documentation on them](/docs/react/helper-functions#setters).

## TypeScript

Some adjusting of your types might be needed due to the following changes:

* When a transform function is added, setters for  `data` and `fields` will have looser types. They’ll have an `unknown` argument and expect you to guarantee that the shape will follow your `Data` type on your `transform` function.
* `initialValues` will have a type of `unknown` when a `transform` function is used.
