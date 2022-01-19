---
section: Accessibility
---

## Accessibility

Felte's main package only cares about handling the reactivity of your form. In this sense, you should be the one taking into consideration the accessibility of it, like the correct use of labels, proper color contrast, focus management, etc.

That said, Felte _does_ set `aria-invalid` to the inputs it controls when they contain validation errors. Also, the `reporter` packages do have some accessibility considerations built-in:

- **`@felte/reporter-tippy`** sets an `aria-live` attribute to the tooltip instance itself to announce when an error appears. Tippy itself also adds an `aria-describedby` attribute to your input. If there are errors on submit, it'll focus the first invalid element of your form.
- **`@felte/reporter-dom`** sets an `aria-live` attribute to the added nodes containing your validation messages. It also focuses the first invalid input if therer are errors on submit.
- **`@felte/reporter-cvapi`** while not recommended due to its non-friendly behaviour for mobile users, it is accessible by default since it uses the browser's built-in validation mechanism.
- **`@felte/reporter-svelte`** does not take any accessibility considerations since its only job is to give you the validation messages. You should set an `aria-live` when necessary.
