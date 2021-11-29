---
section: Multi page forms
---

## Multi page forms

[Where possible, long forms should be divided into multiple smaller forms that constitute a series of logical steps or stages](https://www.w3.org/WAI/tutorials/forms/multi-page/). If you were building something like this on a traditional server-side rendered site, the most logical thing to do would be to have a separate, distinct form for each step. The submit action of each step would do something with the current data and go to the next step. If you want to keep your forms in a way that would make them work without JS, this is the way you will need to do it with Felte as well. Here we will outline a possible solution on how to handle this that might serve as inspiration for your own solution.

### Structure of each page

Each page can be made the same as how you would do a single page form, with a few additions:

- We need a way to communicate to the parent that the current form has been submitted.
- We need a way to communicate to the parent that the user wants to go to the previous page.
- We need a way to set initial values for the current page to display the most up to date information of our forms when navigating our pages.

The easiest way to do this would be to pass our initial values and handlers as props, but you may use custom events or context for this. As an example, we will use props in this case:

```html
<script>
  import { createForm } from 'felte';

  export let initialValues;
  export let onSubmit;
  export let onBack;

  const { form, data } = createForm({ onSubmit });
</script>

<form use:form>
  <input name="firstName">
  <input name="lastName">
  <input name="aboutMe">
  <button type="button" on:click="{() => onBack($data)}">
    Previous page
  </button>
  <button type="submit">Next page</button>
</form>
```

### Parent component

Our parent component's purpose will be to handle the state of all of our pages, to keep track of the current page we're in and to handle when the user submits a form or goes back to a previous page.

```html
<script>
  // We import our page components (similar to the one above).
  import Page1 from './Page1.svelte';
  import Page2 from './Page2.svelte';

  const pages = [Page1, Page2];

  // The current page of our form.
  let page = 0;

  // The state of all of our pages
  let pagesState = [];

  // Our handlers
  function onSubmit(values) {
    if (page === pages.length - 1) {
      // On our final page we POST our data somewhere
      return fetch('https://example.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pagesState),
      }).then(response => {
        // We handle the response
      });
    } else {
      // If we're not on the last page, store our data and increase a step
      pagesState[page] = values;
      pagesState = pagesState; // Triggering update
      page +=1;
    }
  }

  function onBack(values) {
    if (page === 0) return;
    pagesState[page] = values;
    pagesState = pagesState; // Triggering update
    page -= 1;
  }
</script>

<!-- We display the current step here -->
<svelte:component
  this={pages[page]}
  {onSubmit}
  {onBack}
  initialValues={pagesState[page]}
  />
```

> We have made a functional example of this on [Svelte's REPL](https://svelte.dev/repl/8eb738732cf74edd86f680c53e6ba253?version=3.44.2).
