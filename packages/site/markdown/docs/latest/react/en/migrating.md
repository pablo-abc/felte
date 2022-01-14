---
section: Migrating
subsections:
  - Helpers
  - TypeScript
  - Configuration
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

### TypeScript

Some adjusting of your types might be needed due to the following changes:

* When a transform function is added, setters for  `data` and `fields` will have looser types. They’ll have an `unknown` argument and expect you to guarantee that the shape will follow your `Data` type on your `transform` function.
* `initialValues` will have a type of `unknown` when a `transform` function is used.

### Configuration

* `initialValues` now passes through transform functions. This was a bug previously but some people might have relied on this.

### data-felte-unset-on-remove

Felte no longer keeps the value of a removed field in your stores by default. And the attribute used to indicate you _want_ this to happen, `data-felte-unset-on-remove`, has been removed. Instead we now have an attribute `data-felte-keep-on-remove` that does the opposite.

This was done since we felt it was more intuitive for Felte to always represent the _visible_ state of the form by default, and it keeps it consistent to how a browser would submit a form by default: if a control is not on the DOM, there's no value to submit. Allowing to override this behaviour if explicitly defined.

If you want to keep the same behaviour as before:

* Add `data-felte-keep-on-remove` to any removable control you had that did not have a `data-felte-unset-on-remove`or had `data-felte-unset-on-remove="false"` previously.

* Remove `data-felte-unset-on-remove="true"` to inputs that had it, or add `data-felte-keep-on-remove="false"` if it was used to override a fieldset.
