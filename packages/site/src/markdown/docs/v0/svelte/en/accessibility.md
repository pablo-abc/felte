---
section: Accessibility
---

## Accessibility

Felte's main package only cares about handling the reactivity of your form. In this sense, you should be the one taking into consideration the accessibility of it, like the correct use of labels, proper color contrast, focus management, etc.

That said, the `reporter` packages do have some accessibility considerations built-in:

- **`@felte/reporter-tippy`** sets `aria-invalid` for each invalid field and announces to screen readers whenever a tooltip appears and whenever it changes by setting an `aria-live` attribute to the tooltip instance itself. Tippy itself also adds an `aria-describedby` attribute to your input. If there are errors on submit, it'll focus the first invalid element of your form.
- **`@felte/reporter-dom`** sets `aria-invalid` for each invalid field and announces to screen readers whenever an error message is displayed on your container by setting an `aria-live` attribute to them. It also focuses the first invalid input if therer are errors on submit.
- **`@felte/reporter-cvapi`** while not recommended due to its non-friendly behaviour for mobile users, it is accessible by default since it uses the browser's built-in validation mechanism.
- **`@felte/reporter-svelte`** sets `aria-invalid` for each invalid field, but doesn't provide anything else like the previous packages since the display of the error message is up to you, so you should consider using `aria-live` appropriately.
