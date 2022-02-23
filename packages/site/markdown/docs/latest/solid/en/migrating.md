---
section: Migrating
subsections:
  - Stores
  - Observables
  - Helpers
  - TypeScript
  - Configuration
  - data-felte-unset-on-remove
  - Dynamic forms
  - Proxies
  - Extending
  - Fieldsets
  - data-felte-index
  - Validators
  - Errors and warnings
---

## Migrating from 0.x

### Stores

The stores for `data`, `errors`, `warnings` and `touched` are no longer Solid stores but accessors (similar to the ones returned by `createsignal`). Due to our previous implementation with stores, effects re-ran even if the property of the store you were listening to did not change. With our new accessors for said stores it's possible to "subscribe" to a specific property and have an effect only re-run when said property changes:

```javascript
const { data } = createForm({ /* ... */ });

createEffect(() => {
  // This will only run when the value of `email` changes.
  console.log(data(($data) => $data.email));
  // Alternative way to write this:
  console.log(data('email'));
});
```

The following changes will need to be done in your code:

* For accessing the value of `data`, `warnings`, `errors`, and `touched`, instead of using the `store` directly, you'll need to call it. For example, for obtaining the value of `data` you'll need to write `data()`.
* For accessing a specific property of a store you'll need to pass an argument to the `store` when calling it, either a selector or a string path. For example, `data.email` should now be `data((d) => d.email)` _or_ `data('email')`.

> *NOTE*: You _could_ do `data().email` but this would re-run effects when _any_ value of `data` changes, not only when the value of `email` changes.

The rest of the stores are still signals just like before, but now they can optionally accept a function as an argument to obtain a derived value.

### Observables

Although undocumented, we used to return a property `observables` from `createForm` that contained all stores in the form of observables. This is no longer the case since the new `setters` (mentioned in the next section) fulfill the role of `update` and `set`.

### Helpers

The returned helpers have changed.
* `setField` and `setFields` are now only one function: `setFields` that accepts both signatures (and more). For example:
```javascript
setField('email', 'zaphod@beeblebrox.com')
```
should now be
```javascript
setFields('email', 'zaphod@beeblebrox.com')
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

> These functions now can do more than before. Be sure to check the [documentation on them](/docs/solid/helper-functions#setters).

* `getField` is no longer returned from `createForm`, since this is obsolete now due to the accessors returned by `createForm`.

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

### Dynamic forms

On v0.x, if you had an array of fields with this data:

```javascript
const data = {
  multipleFields: [
    'value 1',
    'value 2',
    'value 3',
  ],
};
```

And removed the field with a value of `value 2`, the resulting `data` store would look like this:

```javascript
const data = {
  multipleFields: [
    'value 1',
    null,
    'value 3',
  ],
};
```

This is no longer the case. Felte now will splice the array, making the resulting `data` store look like:

```javascript
const data = {
  multipleFields: [
    'value 1',
    'value 3',
  ],
};
```

Felte will also properly keep track of the `errors`, `warnings` and `touched` stores internally.

Originally we thought it would be a good idea to make the index a _unique_ identifier for a field, hence setting values to `null` instead of removing it completely. This conflicted with how most people expected this to work, and with how most people attempted to create array of fields in Felte.

### Proxies

Programatically setting the value of an input component using its `value` prop/attribute directly does not trigger any kind of events that Felte can catch. In order to make this more seamless we originally added a proxy to the inputs of forms tracked by Felte. This ended up causing many race conditions and issues that were difficult to debug (and some we did not manage to solve). To ease maintainability, we've decided to remove this.

The recommended way to programatically change the value of a field is now to use the `setFields` helper, which will update _both_ the `data` store and input's value.

### Extending

We've removed the `addWarnValidator` function that was previously passed to extender functions. Instead, now the `addValidator` function receives an object with options as a second argument. This gives a smaller and more unified API, as well as opening to add more options in the future.

If you have an extender using `addWarnValidator`, you must update it by calling `addValidator` instead with the following options:

```javascript
addValidator(yourValidationFunction, { level: 'warning' });
```

### Fieldsets

We've removed the feature of adding a `name` attribute to a `fieldset` element. While the `fieldset` element _does_ support this attribute, browser's ignore it completely when submitting forms with JS disabled (and when constructing `FormData`). In order to keep a consistent behaviour, we're enforcing dot notation for nested forms from now on.

If you were using this feature, you should update your forms by removing the `name` attribute from your fieldset elements and using dot notation on your inputs. For example, instead of this:

```html
<fieldset name="account">
  <input name="email" />
</fieldset>
```

you should do this:

```html
<fieldset>
  <input name="account.email" />
</fieldset>
```

### data-felte-index

This was removed for similar reasons to the outlined above. Specifically since we now allow to submit forms using a `FormData` or `urlencoded` content type. To be able to support all these options, we now require for all inputs to use dot notation for this use-case as well.

If you were using this feature, you should update your forms by removing the `data-felte-index` attribute and adding it to your input's name using dot notation. For example, instead of this:

```html
<input data-felte-index="1" name="friend" />
```

you should do this:

```html
<input name="friend.1" />
```

### Validators

Validator packages no longer extend Felte's configuration, but accept a configuration object directly by being called as a function. This allows to handle multiple schemas if needed. You should check the [updated documentation](/docs/solid/validators). But in short, using `zod` as an example, you should change this:

```javascript
createForm({
  extend: validator,
  validateSchema: schema,
})
```

To this:

```javascript
createForm({
  extend: validator({ schema }),
})
```

`@felte/validator-superstruct` now exports a `validator` function instead of a `createValidator` function.

### Errors and warnings

In order to mantain an always consistent shape, the `errors` and `warnings` store now will always contain `null` or an array of strings if there are errors, even if your validation strategy returns single strings as validation messages.
