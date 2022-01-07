---
section: Migrating
subsections:
  - Helpers
  - Reporter Svelte
---

## Migrating from 0.x

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

> These functions now can do more than before. Be sure to check the [documentation on them](/docs/svelte/helper-functions#setters).


* `getField` is no longer returned from `createForm`, this has been replaced by a new utility function exported from `felte` called `getValue` that works for any store.

```html
<script>
  import { createForm } from 'felte';

  // ...

  const { getField } = createForm({ /* ... */ });
  const email = getField('email');
</script>
```
should now be
```html
<script>
  import { getValue, createForm } from 'felte';

  // ...

  const { data } = createForm({ /* ... */ });
  const email = getValue($data, 'email');
</script>
```

### Reporter Svelte

`@felte/reporter-svelte` exports the reporter as `reporter` now instead of `svelteReporter` in order to maintain consistency with other packages.

```javascript
import { svelteReporter } from '@felte/reporter-svelte';
```
should now be
```javascript
import { reporter } from '@felte/reporter-svelte';
```
