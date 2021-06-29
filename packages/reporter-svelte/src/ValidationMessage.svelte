<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { _get, isFieldSetElement, getIndex } from '@felte/common';
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

  function getPath() {
    let path = errorFor;
    path = typeof index === 'undefined' ? path : `${path}[${index}]`;
    let parent = element.parentNode;
    if (!parent) return path;
    while (parent && parent.nodeName !== 'FORM') {
      if (isFieldSetElement(parent) && parent.name) {
        const index = getIndex(parent);
        const fieldsetName =
              typeof index === 'undefined' ? parent.name : `${parent.name}[${index}]`;
        path = `${fieldsetName}.${path}`;
      }
      parent = parent.parentNode;
    }
    return path;
  }
  onMount(() => {
    errorPath = getPath();
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
