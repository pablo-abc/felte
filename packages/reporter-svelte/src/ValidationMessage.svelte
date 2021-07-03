<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { _get, getPath } from '@felte/common';
  import { errorStores } from './stores';

  export let index = undefined;
  let errorFor;
  export { errorFor as for };

  let errors;
  let errorPath;
  let element;

  function getFormElement() {
    let form = element.parentNode;
    if (!form) return;
    while (form && form.nodeName !== 'FORM') {
      form = form.parentNode;
    }
    return form;
  }

  onMount(() => {
    const path = index ? `${errorFor}[${index}]` : errorFor;
    errorPath = getPath(element, path);
    const formElement = getFormElement();
    if (!formElement) errors = writable({});
    else errors = errorStores[formElement.dataset.felteReporterSvelteId];
  });
  $: messages = errorPath && _get($errors, errorPath)
</script>

<div bind:this={element} style="display: none;" />
{#if errorPath && (messages || !$$slots.placeholder)}
  <slot {messages}></slot>
{:else if errorPath}
  <slot name="placeholder"></slot>
{/if}
