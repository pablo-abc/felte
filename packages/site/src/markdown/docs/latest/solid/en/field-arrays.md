---
section: Field arrays
---

## Field arrays

Felte supports creating fields from arrays by adding an index to its name. There's a few things to consider when working with field arrays:

* A field's name that belongs to an array _must_ refer to an object, for example: `"interests.0.value"`. This is how Felte differentiates between field arrays and multiple checkboxes.
* When setting initial values, Felte will _only_ consider arrays of objects as arrays of fields. Empty arrays will be treated as a checkbox field without any value initially selected. It's better to not set an initial value for field arrays if no field should be initially rendered.
* Felte does not keep the same objects on update, so `Index` should be used instead of `For`.

`createForm` also returns some helpers to manage field arrays:

* [`addField`](/docs/solid/helper-functions#addfield) to add a field at a specific index, or at the end if no index is provided.
* [`unsetField`](/docs/solid/helper-functions#unsetfield) to remove a field completely from your stores.
* [`swapFields`](/docs/solid/helper-functions#swapfields) to swap the position of two fields.
* [`moveField`](/docs/solid/helper-functions#movefield) to move a field from one position to another.

Using field arrays would look something like this:

```jsx
import { Index } from 'solid-js/web';
import { createForm } from '@felte/solid';

function Form() {
  const { form, data, addField, unsetField } = createForm({
    initialValues: {
      interests: [{ value: '' }],
    },
  });

  const interests = () => data('interests');

  function removeInterest(index) {
    return () => unsetField(`interests.${index}`);
  }

  function addInterest(index) {
    return () => addField(`interests`, { value: '' }, index);
  }

  return (
    <form use:form>
      <Index each={interests()}>
        {(_, index) => (
          <div>
            <input name={`interests.${index}.value`} />
            <button type="button" onClick={addInterest(index + 1)}>
              Add Interest
            </button>
            <button type="button" onClick={removeInterest(index)}>
              Remove Interest
            </button>
          </div>
        })
      </Index>
    </form>
  );
}
```
